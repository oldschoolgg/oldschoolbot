import { notEmpty, randFloat, randInt } from 'e';
import { Bank, Monsters, MonsterSlayerMaster } from 'oldschooljs';
import Monster from 'oldschooljs/dist/structures/Monster';

import { KourendKebosDiary, userhasDiaryTier } from '../../lib/diaries';
import { BitField, PvMMethod } from '../constants';
import { CombatOptionsEnum } from '../minions/data/combatConstants';
import { BSOMonsters } from '../minions/data/killableMonsters/custom/customMonsters';
import { KillableMonster } from '../minions/types';
import { prisma } from '../settings/prisma';
import { getNewUser } from '../settings/settings';
import { SkillsEnum } from '../skilling/types';
import { bankHasItem, roll, stringMatches } from '../util';
import itemID from '../util/itemID';
import resolveItems from '../util/resolveItems';
import { autoslayModes } from './constants';
import { slayerMasters } from './slayerMasters';
import { SlayerRewardsShop, SlayerTaskUnlocksEnum } from './slayerUnlocks';
import { bossTasks } from './tasks/bossTasks';
import { AssignableSlayerTask, SlayerMaster } from './types';

export enum SlayerMasterEnum {
	Reserved,
	Turael,
	Mazchna,
	Vannaka,
	Chaeldar,
	Konar,
	Nieve,
	Duradel
}

export interface DetermineBoostParams {
	cbOpts: CombatOptionsEnum[];
	user: MUser;
	monster: KillableMonster;
	method?: PvMMethod | null;
	isOnTask?: boolean;
}
export function determineBoostChoice(params: DetermineBoostParams) {
	let boostChoice = 'none';

	// BSO Only:
	if (!params.isOnTask) return boostChoice;

	if (params.method && params.method === 'none') {
		return boostChoice;
	}
	if (params.method && params.method === 'barrage') {
		boostChoice = 'barrage';
	} else if (params.method && params.method === 'burst') {
		boostChoice = 'burst';
	} else if (params.method && params.method === 'cannon') {
		boostChoice = 'cannon';
	} else if (params.cbOpts.includes(CombatOptionsEnum.AlwaysIceBarrage) && params.monster!.canBarrage) {
		boostChoice = 'barrage';
	} else if (params.cbOpts.includes(CombatOptionsEnum.AlwaysIceBurst) && params.monster!.canBarrage) {
		boostChoice = 'burst';
	} else if (params.cbOpts.includes(CombatOptionsEnum.AlwaysCannon)) {
		boostChoice = 'cannon';
	}

	if (boostChoice === 'barrage' && params.user.skillLevel(SkillsEnum.Magic) < 94) {
		boostChoice = 'burst';
	}
	return boostChoice;
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

export function weightedPick(filteredTasks: AssignableSlayerTask[]) {
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

	let task = filteredTasks[result];

	return task;
}

export function userCanUseMaster(user: MUser, master: SlayerMaster) {
	return (
		user.QP >= (master.questPoints ?? 0) &&
		user.skillLevel(SkillsEnum.Slayer) >= (master.slayerLvl ?? 0) &&
		user.combatLevel >= (master.combatLvl ?? 0)
	);
}

export function userCanUseTask(
	user: MUser,
	task: AssignableSlayerTask,
	master: SlayerMaster,
	allowBossTasks: boolean = false
) {
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
	if (lmon === 'grotesque guardians' && !bankHasItem(user.bank.bank, itemID('Brittle key'))) return false;
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
	return true;
}

export async function assignNewSlayerTask(_user: MUser, master: SlayerMaster) {
	const unlocks = _user.user.slayer_unlocks;
	// assignedTask is the task object, currentTask is the database row.
	const baseTasks = [...master.tasks].filter(t => userCanUseTask(_user, t, master, false));
	let bossTask = false;
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

	let assignedTask: AssignableSlayerTask | null = null;
	if (bossTask) {
		const baseBossTasks = bossTasks.filter(t => userCanUseTask(_user, t, master, true));
		if (baseBossTasks.length) {
			assignedTask = weightedPick(baseBossTasks);
		} else {
			assignedTask = weightedPick(baseTasks);
		}
	} else {
		assignedTask = weightedPick(baseTasks);
	}

	const newUser = await getNewUser(_user.id);

	let quantity = randInt(assignedTask!.amount[0], assignedTask!.amount[1]);

	const extendReward = SlayerRewardsShop.find(srs => srs.extendID && srs.extendID.includes(assignedTask!.monster.id));
	if (extendReward && unlocks.includes(extendReward.id)) {
		quantity = assignedTask.extendedAmount
			? randInt(assignedTask.extendedAmount[0], assignedTask.extendedAmount[1])
			: Math.ceil(quantity * extendReward.extendMult!);
	}

	let messages: string[] = [];
	if (unlocks.includes(SlayerTaskUnlocksEnum.SizeMatters)) {
		quantity *= 2;
		messages.push('2x qty for Size Matters unlock');
	}
	if (_user.bitfield.includes(BitField.HasScrollOfLongevity)) {
		quantity *= 2;
		messages.push('2x qty for Scroll of longevity');
	}

	const currentTask = await prisma.slayerTask.create({
		data: {
			user_id: newUser.id,
			quantity,
			quantity_remaining: quantity,
			slayer_master_id: master.id,
			monster_id: assignedTask!.monster.id,
			skipped: false
		}
	});
	await _user.update({
		slayer_last_task: assignedTask!.monster.id
	});

	return { currentTask, assignedTask, messages };
}

export function calcMaxBlockedTasks(user: MUser) {
	const qps = user.QP;
	// 6 Blocks total 5 for 250 qps, + 1 for lumby.
	// For now we're do 1 free + 1 for every 50 qps.
	let amount = Math.min(1 + Math.floor(qps / 50), 6);

	const unlocks = user.user.slayer_unlocks;
	const hasBlockAndRoll = unlocks.includes(SlayerTaskUnlocksEnum.BlockAndRoll);

	if (hasBlockAndRoll) {
		amount += 3;
	}
	return amount;
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

	const slayerMaster = currentTask ? slayerMasters.find(master => master.id === currentTask.slayer_master_id) : null;

	return {
		currentTask: currentTask ?? null,
		assignedTask: currentTask ? slayerMaster!.tasks.find(m => m.monster.id === currentTask.monster_id)! : null,
		slayerMaster
	};
}

export const allSlayerHelmets = [
	'Slayer helmet',
	'Slayer helmet (i)',
	'Black slayer helmet',
	'Black slayer helmet (i)',
	'Green slayer helmet',
	'Green slayer helmet (i)',
	'Red slayer helmet',
	'Red slayer helmet (i)',
	'Purple slayer helmet',
	'Purple slayer helmet (i)',
	'Turquoise slayer helmet',
	'Turquoise slayer helmet (i)',
	'Hydra slayer helmet',
	'Hydra slayer helmet (i)',
	'Twisted slayer helmet',
	'Twisted slayer helmet (i)'
];

export function getSlayerMasterOSJSbyID(slayerMasterID: number) {
	const osjsSlayerMaster = [
		MonsterSlayerMaster.Turael,
		MonsterSlayerMaster.Turael,
		MonsterSlayerMaster.Mazchna,
		MonsterSlayerMaster.Vannaka,
		MonsterSlayerMaster.Chaeldar,
		MonsterSlayerMaster.Konar,
		MonsterSlayerMaster.Nieve,
		MonsterSlayerMaster.Duradel,
		MonsterSlayerMaster.Krystilia
	];
	return osjsSlayerMaster[slayerMasterID];
}

export function getSlayerReward(id: SlayerTaskUnlocksEnum): string {
	const { name } = SlayerRewardsShop.find(srs => {
		return srs!.id === id;
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

export function filterLootReplace(myBank: Bank, myLoot: Bank) {
	// Order: Fang, eye, heart.
	const numBlackMask = myLoot.amount('Black mask (10)');
	let numHydraEyes = myLoot.amount("Hydra's eye");
	numHydraEyes += myLoot.amount("Hydra's fang");
	numHydraEyes += myLoot.amount("Hydra's heart");
	const numDarkTotemBases = myLoot.amount('Dark totem base');
	const numBludgeonPieces = myLoot.amount('Bludgeon claw');
	const ringPieces = resolveItems(["Hydra's eye", "Hydra's fang", "Hydra's heart"]) as number[];
	const totemPieces = resolveItems(['Dark totem base', 'Dark totem middle', 'Dark totem top']) as number[];
	const bludgeonPieces = resolveItems(['Bludgeon claw', 'Bludgeon spine', 'Bludgeon axon']) as number[];

	myLoot.filter(l => {
		return (
			l.id !== itemID('Black mask (10)') &&
			l.id !== itemID("Hydra's eye") &&
			l.id !== itemID("Hydra's fang") &&
			l.id !== itemID("Hydra's heart") &&
			l.id !== itemID('Dark totem base') &&
			l.id !== itemID('Dark totem middle') &&
			l.id !== itemID('Dark totem top') &&
			l.id !== itemID('Bludgeon claw')
		);
	}, true);

	const myClLoot = new Bank(myLoot.bank);

	if (numBlackMask) {
		for (let x = 0; x < numBlackMask; x++) {
			myLoot.add('Black mask');
			myClLoot.add('Black mask (10)');
		}
	}

	const combinedBank = new Bank().add(myBank).add(myLoot);
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
	const result: { monster_id: number; total_quantity: number; qty: number }[] =
		await prisma.$queryRaw`SELECT monster_id, SUM(quantity) AS total_quantity, COUNT(monster_id) AS qty
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
