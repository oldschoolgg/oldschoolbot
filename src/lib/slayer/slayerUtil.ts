import { notEmpty, objectKeys, randFloat, randInt } from 'e';
import { Bank, type Monster, Monsters } from 'oldschooljs';

import { resolveItems } from 'oldschooljs/dist/util/util';
import { LumbridgeDraynorDiary, userhasDiaryTier } from '../../lib/diaries';
import { CombatAchievements } from '../combat_achievements/combatAchievements';
import type { PvMMethod } from '../constants';
import { CombatOptionsEnum } from '../minions/data/combatConstants';
import type { KillableMonster } from '../minions/types';

import { getNewUser } from '../settings/settings';
import { SkillsEnum } from '../skilling/types';
import { roll, stringMatches } from '../util';
import { logError } from '../util/logError';
import { autoslayModes } from './constants';
import { slayerMasters } from './slayerMasters';
import { SlayerRewardsShop, SlayerTaskUnlocksEnum } from './slayerUnlocks';
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
	cbOpts: readonly CombatOptionsEnum[];
	monster: KillableMonster;
	methods?: PvMMethod[] | null;
	isOnTask?: boolean;
	wildyBurst?: boolean;
}
export function determineCombatBoosts(params: DetermineBoostParams): PvMMethod[] {
	// if EHP slayer (PvMMethod) the methods are initialized with boostMethods variable
	const boostMethods = (params.methods ?? ['none']).flat().filter(method => method);

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

export function calculateSlayerPoints(currentStreak: number, master: SlayerMaster, hasKourendElite: boolean) {
	const streaks = [1000, 250, 100, 50, 10];
	const multiplier = [50, 35, 25, 15, 5];

	if (currentStreak < 5) {
		return 0;
	}

	let { basePoints } = master;

	// Boost points to 20 for Konar + Kourend Elites
	if (master.name === 'Konar quo Maten' && hasKourendElite) {
		basePoints = 20;
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

	const newUser = await getNewUser(_user.id);

	let maxQuantity = assignedTask?.amount[1];
	if (bossTask && _user.user.slayer_unlocks.includes(SlayerTaskUnlocksEnum.LikeABoss)) {
		for (const tier of objectKeys(CombatAchievements)) {
			if (_user.hasCompletedCATier(tier)) {
				maxQuantity += 5;
			}
		}
	}

	const quantity = randInt(assignedTask?.amount[0], maxQuantity);
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

	return { currentTask, assignedTask };
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

export type CurrentSlayerInfo = Awaited<ReturnType<typeof getUsersCurrentSlayerInfo>>;
export async function getUsersCurrentSlayerInfo(id: string) {
	const [currentTask, partialUser] = await prisma.$transaction([
		prisma.slayerTask.findFirst({
			where: {
				user_id: id,
				quantity_remaining: {
					gt: 0
				},
				skipped: false
			}
		}),
		prisma.user.findFirst({
			where: {
				id
			},
			select: {
				slayer_points: true
			}
		})
	]);

	const slayerPoints = partialUser?.slayer_points ?? 0;

	if (!currentTask) {
		return {
			currentTask: null,
			assignedTask: null,
			slayerMaster: null,
			slayerPoints
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
			slayerMaster: null,
			slayerPoints
		};
	}

	return {
		currentTask,
		assignedTask,
		slayerMaster,
		slayerPoints
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

	for (const req of required) {
		if (!myUnlocks.includes(req)) {
			success = false;
			missing.push(getSlayerReward(req as SlayerTaskUnlocksEnum));
		}
	}

	errors = missing.join(', ');
	return { success, errors };
}

const filterLootItems = resolveItems([
	"Hydra's eye",
	"Hydra's fang",
	"Hydra's heart",
	'Noxious point',
	'Noxious blade',
	'Noxious pommel',
	'Dark totem base',
	'Dark totem middle',
	'Dark totem top',
	'Bludgeon claw'
]);
const hydraPieces = resolveItems(["Hydra's eye", "Hydra's fang", "Hydra's heart"]);
const noxPieces = resolveItems(['Noxious point', 'Noxious blade', 'Noxious pommel']);
const totemPieces = resolveItems(['Dark totem base', 'Dark totem middle', 'Dark totem top']);
const bludgeonPieces = resolveItems(['Bludgeon claw', 'Bludgeon spine', 'Bludgeon axon']);

function filterPieces(myLoot: Bank, myClLoot: Bank, combinedBank: Bank, pieces: number[], numPieces: number) {
	for (let x = 0; x < numPieces; x++) {
		const bank: number[] = pieces.map(piece => combinedBank.amount(piece));
		const minBank = Math.min(...bank);
		for (let i = 0; i < bank.length; i++) {
			if (bank[i] === minBank) {
				myLoot.add(pieces[i]);
				combinedBank.add(pieces[i]);
				myClLoot.add(pieces[i]);
				break;
			}
		}
	}
}

export function filterLootReplace(myBank: Bank, myLoot: Bank) {
	const numHydraPieces =
		myLoot.amount("Hydra's eye") + myLoot.amount("Hydra's fang") + myLoot.amount("Hydra's heart");
	const numNoxPieces =
		myLoot.amount('Noxious point') + myLoot.amount('Noxious blade') + myLoot.amount('Noxious pommel');
	const numTotemPieces = myLoot.amount('Dark totem base');
	const numBludgeonPieces = myLoot.amount('Bludgeon claw');

	if (!numHydraPieces && !numNoxPieces && !numTotemPieces && !numBludgeonPieces) {
		return { bankLoot: myLoot, clLoot: myLoot };
	}

	for (const item of filterLootItems) {
		myLoot.set(item, 0);
	}

	const myClLoot = myLoot.clone();
	const combinedBank = new Bank(myBank).add(myLoot);

	if (numHydraPieces) {
		filterPieces(myLoot, myClLoot, combinedBank, hydraPieces, numHydraPieces);
	}
	if (numNoxPieces) {
		filterPieces(myLoot, myClLoot, combinedBank, noxPieces, numNoxPieces);
	}
	if (numTotemPieces) {
		filterPieces(myLoot, myClLoot, combinedBank, totemPieces, numTotemPieces);
	}
	if (numBludgeonPieces) {
		filterPieces(myLoot, myClLoot, combinedBank, bludgeonPieces, numBludgeonPieces);
	}

	return {
		bankLoot: myLoot,
		clLoot: myClLoot
	};
}

export async function getSlayerTaskStats(userID: string) {
	const result: { monster_id: number; total_quantity: number; qty: number }[] =
		await prisma.$queryRaw`SELECT monster_id, SUM(quantity)::int AS total_quantity, COUNT(monster_id)::int AS qty
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
