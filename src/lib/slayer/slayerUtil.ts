import { notEmpty, objectKeys, randFloat, randInt } from 'e';
import { Bank, Monsters } from 'oldschooljs';
import type Monster from 'oldschooljs/dist/structures/Monster';

import { KourendKebosDiary, LumbridgeDraynorDiary, userhasDiaryTier } from '../../lib/diaries';
import { CombatAchievements } from '../combat_achievements/combatAchievements';
import { BitField, type PvMMethod } from '../constants';
import { CombatOptionsEnum } from '../minions/data/combatConstants';
import { BSOMonsters } from '../minions/data/killableMonsters/custom/customMonsters';
import type { KillableMonster } from '../minions/types';

import { SkillsEnum } from '../skilling/types';
import { roll, stringMatches } from '../util';
import { logError } from '../util/logError';
import resolveItems from '../util/resolveItems';
import { autoslayModes } from './constants';
import { slayerMasters } from './slayerMasters';
import { SlayerRewardsShop, SlayerTaskUnlocksEnum } from './slayerUnlocks';
import { allSlayerTasks } from './tasks';
import { bossTasks, wildernessBossTasks } from './tasks/bossTasks';
import type { AssignableSlayerTask, SlayerMaster } from './types';

export enum SlayerMasterEnum {
	Reserved = 0,
	Turael = 1,
	Mazchna = 2,
	Vannaka = 3,
	Chaeldar = 4,
	Konar = 5,
	Nieve = 6,
	Duradel = 7
}

interface DetermineBoostParams {
	cbOpts: CombatOptionsEnum[];
	user: MUser;
	monster: KillableMonster;
	methods?: PvMMethod[] | null;
	isOnTask?: boolean;
	wildyBurst?: boolean;
}
export function determineCombatBoosts(params: DetermineBoostParams) {
	// if EHP slayer (PvMMethod) the methods are initialized with boostMethods variable
	let boostMethods = ['none'];

	// the user can only burst/barrage/cannon while on task in BSO
	if (!params.isOnTask) return boostMethods;

	boostMethods = (params.methods ?? ['none']).flat().filter(method => method);

	// check if user has cannon combat option turned on
	if (params.cbOpts.includes(CombatOptionsEnum.AlwaysCannon)) {
		boostMethods.includes('cannon') ? null : boostMethods.push('cannon');
	}

	// check for special burst case under wildyBurst variable
	if (params.wildyBurst) {
		if (params.cbOpts.includes(CombatOptionsEnum.AlwaysIceBarrage)) {
			boostMethods.includes('barrage') ? null : boostMethods.push('barrage');
		}
		if (params.cbOpts.includes(CombatOptionsEnum.AlwaysIceBurst)) {
			boostMethods.includes('burst') ? null : boostMethods.push('burst');
		}
	}

	// check if the monster can be barraged
	if (params.monster.canBarrage) {
		// check if the monster exists in catacombs
		if (params.monster.existsInCatacombs) {
			if (params.cbOpts.includes(CombatOptionsEnum.AlwaysIceBarrage)) {
				boostMethods.includes('barrage') ? null : boostMethods.push('barrage');
			}
			if (params.cbOpts.includes(CombatOptionsEnum.AlwaysIceBurst)) {
				boostMethods.includes('burst') ? null : boostMethods.push('burst');
			}
		} else if (!params.monster.cannonMulti) {
			// prevents cases such as: cannoning in singles but receiving multi combat bursting boost
			return boostMethods;
		} else {
			if (params.cbOpts.includes(CombatOptionsEnum.AlwaysIceBarrage)) {
				boostMethods.includes('barrage') ? null : boostMethods.push('barrage');
			}
			if (params.cbOpts.includes(CombatOptionsEnum.AlwaysIceBurst)) {
				boostMethods.includes('burst') ? null : boostMethods.push('burst');
			}
		}
	}

	return boostMethods;
}

export async function calculateSlayerPoints(currentStreak: number, master: SlayerMaster, user: MUser) {
	const streaks = [1000, 250, 100, 50, 10];
	const multiplier = [50, 35, 25, 15, 5];

	if (currentStreak < 5) {
		return 0;
	}

	let { basePoints } = master;

	// Boost points to 20 for Konar + Kourend Elites
	if (master.name === 'Konar quo Maten') {
		const [hasKourendElite] = await userhasDiaryTier(user, KourendKebosDiary.elite);
		if (hasKourendElite) {
			basePoints = 20;
		}
	}
	for (let i = 0; i < streaks.length; i++) {
		if (currentStreak >= streaks[i] && currentStreak % streaks[i] === 0) {
			return basePoints * multiplier[i];
		}
	}
	return basePoints;
}

function weightedPick(filteredTasks: AssignableSlayerTask[]) {
	let totalweight = 0;
	for (let i = 0; i < filteredTasks.length; i++) {
		totalweight += filteredTasks[i].weight;
	}
	const randomWeight = randFloat(1, totalweight);

	let result = 0;
	let weight = 0;

	for (let i = 0; i < filteredTasks.length; i++) {
		weight += filteredTasks[i].weight;
		if (randomWeight <= weight) {
			result = i;
			break;
		}
	}

	const task = filteredTasks[result];

	return task;
}

export function userCanUseMaster(user: MUser, master: SlayerMaster) {
	return (
		user.QP >= (master.questPoints ?? 0) &&
		user.skillLevel(SkillsEnum.Slayer) >= (master.slayerLvl ?? 0) &&
		user.combatLevel >= (master.combatLvl ?? 0)
	);
}

function userCanUseTask(user: MUser, task: AssignableSlayerTask, master: SlayerMaster, allowBossTasks = false) {
	if (task.isBoss && !allowBossTasks) return false;
	if (task.dontAssign) return false;
	const myLastTask = user.user.slayer_last_task;
	if (myLastTask === task.monster.id) return false;
	if (task.combatLevel && task.combatLevel > user.combatLevel) return false;
	if (task.questPoints && task.questPoints > user.QP) return false;
	if (task.slayerLevel && task.slayerLevel > user.skillLevel(SkillsEnum.Slayer)) return false;
	if (task.levelRequirements && !user.hasSkillReqs(task.levelRequirements)) return false;
	const myBlockList = user.user.slayer_blocked_ids ?? [];
	if (myBlockList.includes(task.monster.id)) return false;
	const myUnlocks = user.user.slayer_unlocks;
	// Slayer unlock restrictions:
	const lmon = task.monster.name.toLowerCase();
	const lmast = master.name.toLowerCase();
	if (
		[
			BSOMonsters.FungalRodent.name,
			BSOMonsters.InfestedAxe.name,
			BSOMonsters.FungalMage.name,
			BSOMonsters.Grifolaroo.name,
			BSOMonsters.Grifolapine.name,
			BSOMonsters.GanodermicRunt.name,
			BSOMonsters.GanodermicBeast.name
		].includes(task.monster.name) &&
		!myUnlocks.includes(SlayerTaskUnlocksEnum.PoreDecisions)
	) {
		return false;
	}
	if (lmon === 'grotesque guardians' && !user.bank.has('Brittle key')) return false;
	if (lmon === 'lizardman' && !myUnlocks.includes(SlayerTaskUnlocksEnum.ReptileGotRipped)) return false;
	if (lmon === 'red dragon' && !myUnlocks.includes(SlayerTaskUnlocksEnum.SeeingRed)) return false;
	if (lmon === 'mithril dragon' && !myUnlocks.includes(SlayerTaskUnlocksEnum.IHopeYouMithMe)) return false;
	if (lmon === 'aviansie' && !myUnlocks.includes(SlayerTaskUnlocksEnum.WatchTheBirdie)) return false;
	if (lmon === 'tzhaar-ket' && !myUnlocks.includes(SlayerTaskUnlocksEnum.HotStuff)) return false;
	if (lmon === 'spitting wyvern' && myUnlocks.includes(SlayerTaskUnlocksEnum.StopTheWyvern)) return false;
	if (
		lmon === 'feral vampyre' &&
		(lmast === 'konar quo maten' || lmast === 'duradel' || lmast === 'nieve' || lmast === 'chaeldar') &&
		!myUnlocks.includes(SlayerTaskUnlocksEnum.ActualVampyreSlayer)
	)
		return false;
	if (
		lmon === 'basilisk' &&
		(lmast === 'konar quo maten' || lmast === 'duradel' || lmast === 'nieve') &&
		!myUnlocks.includes(SlayerTaskUnlocksEnum.Basilocked)
	)
		return false;
	if (
		(lmon === 'dust devil' || lmon === 'greater nechryael' || lmon === 'abyssal demon' || lmon === 'jelly') &&
		lmast === 'krystilia' &&
		!myUnlocks.includes(SlayerTaskUnlocksEnum.IWildyMoreSlayer)
	)
		return false;
	return true;
}

export async function assignNewSlayerTask(_user: MUser, master: SlayerMaster) {
	const unlocks = _user.user.slayer_unlocks;
	// assignedTask is the task object, currentTask is the database row.
	const baseTasks = [...master.tasks].filter(t => userCanUseTask(_user, t, master, false));
	let bossTask = false;
	let wildyBossTask = false;
	if (
		_user.user.slayer_unlocks.includes(SlayerTaskUnlocksEnum.LikeABoss) &&
		(master.name.toLowerCase() === 'konar quo maten' ||
			master.name.toLowerCase() === 'duradel' ||
			master.name.toLowerCase() === 'nieve' ||
			master.name.toLowerCase() === 'chaeldar') &&
		roll(25)
	) {
		bossTask = true;
	}

	if (_user.user.slayer_unlocks.includes(SlayerTaskUnlocksEnum.LikeABoss) && master.id === 8 && roll(25)) {
		wildyBossTask = true;
	}

	let assignedTask: AssignableSlayerTask | null = null;

	if (bossTask) {
		const baseBossTasks = bossTasks.filter(t => userCanUseTask(_user, t, master, true));
		if (baseBossTasks.length > 0) {
			assignedTask = weightedPick(baseBossTasks);
		}
	}

	if (wildyBossTask) {
		const baseWildyBossTasks = wildernessBossTasks.filter(t => userCanUseTask(_user, t, master, true));
		if (baseWildyBossTasks.length > 0) {
			assignedTask = weightedPick(baseWildyBossTasks);
		}
	}

	if (assignedTask === null) {
		assignedTask = weightedPick(baseTasks);
	}

	const newUser = await prisma.newUser.upsert({
		where: {
			id: _user.id
		},
		create: {
			id: _user.id
		},
		update: {}
	});

	let maxQuantity = assignedTask?.amount[1];
	if (bossTask && _user.user.slayer_unlocks.includes(SlayerTaskUnlocksEnum.LikeABoss)) {
		for (const tier of objectKeys(CombatAchievements)) {
			if (_user.hasCompletedCATier(tier)) {
				maxQuantity += 5;
			}
		}
	}

	let quantity = randInt(assignedTask!.amount[0], maxQuantity);

	const extendReward = SlayerRewardsShop.find(srs => srs.extendID?.includes(assignedTask!.monster.id));
	if (extendReward && unlocks.includes(extendReward.id)) {
		quantity = assignedTask.extendedAmount
			? randInt(assignedTask.extendedAmount[0], assignedTask.extendedAmount[1])
			: Math.ceil(quantity * extendReward.extendMult!);
	}

	const messages: string[] = [];
	if (unlocks.includes(SlayerTaskUnlocksEnum.SizeMatters) && !_user.bitfield.includes(BitField.DisableSizeMatters)) {
		quantity *= 2;
		messages.push('2x qty for Size Matters unlock');
	}
	if (
		_user.bitfield.includes(BitField.HasScrollOfLongevity) &&
		!_user.bitfield.includes(BitField.ScrollOfLongevityDisabled)
	) {
		quantity *= 2;
		messages.push('2x qty for Scroll of longevity');
	}

	const currentTask = await prisma.slayerTask.create({
		data: {
			user_id: newUser.id,
			quantity,
			quantity_remaining: quantity,
			slayer_master_id: master.id,
			monster_id: assignedTask?.monster.id,
			skipped: false
		}
	});
	await _user.update({
		slayer_last_task: assignedTask?.monster.id
	});

	return { currentTask, assignedTask, messages };
}

export async function calcMaxBlockedTasks(user: MUser) {
	const qps = user.QP;
	let blocks = 0;
	const [hasLumbyDiary] = await userhasDiaryTier(user, LumbridgeDraynorDiary.elite);
	if (hasLumbyDiary) {
		blocks += 1;
	}
	blocks += Math.floor(qps / 50);

	// Limit blocks to 7 due to BSO quest points
	blocks = Math.min(blocks, 7);

	const unlocks = user.user.slayer_unlocks;
	const hasBlockAndRoll = unlocks.includes(SlayerTaskUnlocksEnum.BlockAndRoll);

	if (hasBlockAndRoll) {
		blocks += 3;
	}
	return blocks;
}

export function getCommonTaskName(task: Monster) {
	let commonName = task.name;
	switch (task.id) {
		case Monsters.KalphiteWorker.id:
			commonName = 'Kalphite';
			break;
		case Monsters.MountainTroll.id:
			commonName = 'Troll';
			break;
		case Monsters.FossilIslandWyvernSpitting.id:
			commonName = 'Fossil Island Wyvern';
			break;
		case Monsters.FeralVampyre.id:
			commonName = 'Vampyre';
			break;
		case Monsters.ElfWarrior.id:
			commonName = 'Elves';
			break;
		case Monsters.SpiritualRanger.id:
		case Monsters.SpiritualMage.id:
			commonName = 'Spiritual Creature';
			break;
		case Monsters.BlackBear.id:
			commonName = 'Bear';
			break;
		case Monsters.GuardDog.id:
			commonName = 'Dog';
			break;
		case Monsters.TzHaarKet.id:
			commonName = 'TzHaar';
			break;
		case Monsters.RevenantImp.id:
			commonName = 'Revenant';
			break;
		case Monsters.DagannothPrime.id:
			commonName = 'Dagannoth Kings';
			break;
		default:
	}
	if (commonName !== 'TzHaar' && !commonName.endsWith('s')) commonName += 's';
	return commonName;
}

export async function getUsersCurrentSlayerInfo(id: string) {
	const currentTask = await prisma.slayerTask.findFirst({
		where: {
			user_id: id,
			quantity_remaining: {
				gt: 0
			},
			skipped: false
		}
	});

	if (!currentTask) {
		return {
			currentTask: null,
			assignedTask: null,
			slayerMaster: null
		};
	}

	const slayerMaster = slayerMasters.find(master => master.id === currentTask.slayer_master_id);
	const assignedTask = slayerMaster?.tasks.find(m => m.monster.id === currentTask.monster_id);

	if (!assignedTask || !slayerMaster) {
		logError(
			`Could not find task or slayer master for user ${id} task ${currentTask.monster_id} master ${currentTask.slayer_master_id}`,
			{ userID: id }
		);
		// 'Skip' broken task:
		await prisma.slayerTask.update({
			data: { skipped: true, quantity_remaining: 0 },
			where: { id: currentTask.id }
		});
		return {
			currentTask: null,
			assignedTask: null,
			slayerMaster: null
		};
	}

	return {
		currentTask,
		assignedTask,
		slayerMaster
	};
}

function getSlayerReward(id: SlayerTaskUnlocksEnum): string {
	const { name } = SlayerRewardsShop.find(srs => {
		return srs?.id === id;
	})!;
	return name;
}
export function hasSlayerUnlock(
	myUnlocks: SlayerTaskUnlocksEnum[] | number[],
	required: SlayerTaskUnlocksEnum[] | number[]
) {
	const missing: string[] = [];
	let success = true;
	let errors = '';

	required.forEach(req => {
		if (!myUnlocks.includes(req)) {
			success = false;
			missing.push(getSlayerReward(req as SlayerTaskUnlocksEnum));
		}
	});

	errors = missing.join(', ');
	return { success, errors };
}

const filterLootItems = resolveItems([
	"Hydra's eye",
	"Hydra's fang",
	"Hydra's heart",
	'Dark totem base',
	'Dark totem middle',
	'Dark totem top',
	'Bludgeon claw'
]);
const ringPieces = resolveItems(["Hydra's eye", "Hydra's fang", "Hydra's heart"]);
const totemPieces = resolveItems(['Dark totem base', 'Dark totem middle', 'Dark totem top']);
const bludgeonPieces = resolveItems(['Bludgeon claw', 'Bludgeon spine', 'Bludgeon axon']);

export function filterLootReplace(myBank: Bank, myLoot: Bank) {
	// Order: Fang, eye, heart.
	let numHydraEyes = myLoot.amount("Hydra's eye");
	numHydraEyes += myLoot.amount("Hydra's fang");
	numHydraEyes += myLoot.amount("Hydra's heart");
	const numDarkTotemBases = myLoot.amount('Dark totem base');
	const numBludgeonPieces = myLoot.amount('Bludgeon claw');
	if (!numBludgeonPieces && !numDarkTotemBases && !numHydraEyes) {
		return { bankLoot: myLoot, clLoot: myLoot };
	}

	myLoot.filter(i => !filterLootItems.includes(i.id), true);

	const myClLoot = new Bank(myLoot.bank);

	const combinedBank = new Bank(myBank).add(myLoot);
	if (numBludgeonPieces) {
		for (let x = 0; x < numBludgeonPieces; x++) {
			const bank: number[] = [];

			for (const piece of bludgeonPieces) {
				bank.push(combinedBank.amount(piece));
			}
			const minBank = Math.min(...bank);

			for (let i = 0; i < bank.length; i++) {
				if (bank[i] === minBank) {
					myLoot.add(bludgeonPieces[i]);
					combinedBank.add(bludgeonPieces[i]);
					myClLoot.add(bludgeonPieces[i]);
					break;
				}
			}
		}
	}
	if (numDarkTotemBases) {
		for (let x = 0; x < numDarkTotemBases; x++) {
			const bank: number[] = [];
			for (const piece of totemPieces) {
				bank.push(combinedBank.amount(piece));
			}
			const minBank = Math.min(...bank);
			for (let i = 0; i < bank.length; i++) {
				if (bank[i] === minBank) {
					myLoot.add(totemPieces[i]);
					combinedBank.add(totemPieces[i]);
					myClLoot.add(totemPieces[i]);
					break;
				}
			}
		}
	}
	if (numHydraEyes) {
		for (let x = 0; x < numHydraEyes; x++) {
			const bank: number[] = [];
			for (const piece of ringPieces) {
				bank.push(combinedBank.amount(piece));
			}
			const minBank = Math.min(...bank);
			for (let i = 0; i < bank.length; i++) {
				if (bank[i] === minBank) {
					myLoot.add(ringPieces[i]);
					combinedBank.add(ringPieces[i]);
					myClLoot.add(ringPieces[i]);
					break;
				}
			}
		}
	}
	return {
		bankLoot: myLoot,
		clLoot: myClLoot
	};
}

export async function getSlayerTaskStats(userID: string) {
	const result: { monster_id: number; total_quantity: number; qty: number }[] = await prisma.$queryRaw`SELECT monster_id, SUM(quantity)::int AS total_quantity, COUNT(monster_id)::int AS qty
FROM slayer_tasks
WHERE user_id = ${userID}
AND quantity_remaining = 0
AND skipped = false
GROUP BY monster_id
ORDER BY qty DESC;`;
	return result
		.map(i => {
			const mon = Monsters.get(i.monster_id);
			if (!mon) return null;
			return {
				monsterID: mon.id,
				monsterName: mon.name,
				total_killed: i.total_quantity,
				total_tasks: i.qty
			};
		})
		.filter(notEmpty);
}

export async function setDefaultSlayerMaster(
	user: MUser,
	newMaster: string
): Promise<{ success: boolean; message: string }> {
	if (!newMaster || newMaster === 'clear') {
		await user.update({
			slayer_remember_master: null
		});
		return { success: true, message: 'Saved Slayer master has been erased.' };
	}
	const master = slayerMasters.find(
		sm => stringMatches(newMaster, sm.name) || sm.aliases.some(alias => stringMatches(newMaster, alias))
	);
	if (!master) {
		return { success: false, message: `Couldn't find matching slayer master for '${newMaster}` };
	}
	if (!userCanUseMaster(user, master)) {
		return { success: false, message: `You cannot use ${master.name} to assign tasks yet.` };
	}
	await user.update({
		slayer_remember_master: master.name
	});
	return { success: true, message: `Slayer master updated to: ${master.name}` };
}

export async function setDefaultAutoslay(
	user: MUser,
	newAutoslayMode: string
): Promise<{ success: boolean; message: string }> {
	if (!newAutoslayMode || newAutoslayMode === 'clear') {
		await user.update({
			slayer_autoslay_options: []
		});
		return { success: true, message: 'Saved autoslay method has been erased.' };
	}
	const autoslayOption = autoslayModes.find(
		asc =>
			stringMatches(newAutoslayMode, asc.name) || asc.aliases.some(alias => stringMatches(newAutoslayMode, alias))
	);
	if (!autoslayOption) {
		return { success: false, message: `Couldn't find matching autoslay option for '${newAutoslayMode}` };
	}
	await user.update({
		slayer_autoslay_options: [autoslayOption.key]
	});
	return { success: true, message: `Autoslay method updated to: ${autoslayOption.name} (${autoslayOption.focus})` };
}

export async function isOnSlayerTask({
	user,
	monsterID,
	quantityKilled
}: {
	user: MUser;
	monsterID: number;
	quantityKilled: number;
}) {
	const usersTask = await getUsersCurrentSlayerInfo(user.id);
	const isOnTask =
		usersTask.assignedTask !== null &&
		usersTask.currentTask !== null &&
		usersTask.assignedTask.monsters.includes(monsterID);

	const hasSuperiorsUnlocked = user.user.slayer_unlocks.includes(SlayerTaskUnlocksEnum.BiggerAndBadder);

	if (!isOnTask) return { isOnTask, hasSuperiorsUnlocked };

	const quantitySlayed = Math.min(usersTask.currentTask.quantity_remaining, quantityKilled);

	return {
		isOnTask,
		hasSuperiorsUnlocked,
		quantitySlayed,
		...usersTask
	};
}

export function getAllAlternateMonsters(options: { monster: Monster }): Monster[];
export function getAllAlternateMonsters(options: { monsterId: number }): number[];
export function getAllAlternateMonsters(options: { monster: Monster } | { monsterId: number }) {
	const useMonster = 'monster' in options;
	const monsterId = useMonster ? options.monster.id : options.monsterId;
	const monsters = allSlayerTasks.map(task => (task.monsters.includes(monsterId) ? task.monsters : [])).flat(2);
	return useMonster ? Monsters.filter(m => monsters.includes(m.id)).map(m => m) : monsters;
}
