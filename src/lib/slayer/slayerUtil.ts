import { randFloat, randInt } from 'e';
import { KlasaUser } from 'klasa';
import {  Monsters, MonsterSlayerMaster } from 'oldschooljs';
import Monster from 'oldschooljs/dist/structures/Monster';
import { MoreThan } from 'typeorm';

import { getNewUser } from '../settings/settings';
import { UserSettings } from '../settings/types/UserSettings';
import { SkillsEnum } from '../skilling/types';
import { SlayerTaskTable } from '../typeorm/SlayerTaskTable.entity';
import { roll } from '../util';
import { slayerMasters } from './slayerMasters';
import { SlayerRewardsShop, SlayerTaskUnlocksEnum } from './slayerUnlocks';
import { bossTasks } from './tasks/bossTasks';
import { AssignableSlayerTask, SlayerMaster } from './types';

export function calculateSlayerPoints(currentStreak: number, master: SlayerMaster) {
	const streaks = [1000, 250, 100, 50, 10];
	const multiplier = [50, 35, 25, 15, 5];

	if (currentStreak < 5) {
		return 0;
	}
	for (let i = 0; i < streaks.length; i++) {
		if (currentStreak >= streaks[i] && currentStreak % streaks[i] === 0) {
			return master.basePoints * multiplier[i];
		}
	}
	return master.basePoints;
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

export function userCanUseMaster(user: KlasaUser, master: SlayerMaster) {
	return (
		user.settings.get(UserSettings.QP) >= (master.questPoints ?? 0) &&
		user.skillLevel(SkillsEnum.Slayer) >= (master.slayerLvl ?? 0) &&
		user.combatLevel >= (master.combatLvl ?? 0)
	);
}

export function userCanUseTask(user: KlasaUser, task: AssignableSlayerTask, master: SlayerMaster) {
	if (task.isBoss) return false;
	if (task.combatLevel && task.combatLevel > user.combatLevel) return false;
	if (task.questPoints && task.questPoints > user.settings.get(UserSettings.QP)) return false;
	if (task.slayerLevel && task.slayerLevel > user.skillLevel(SkillsEnum.Slayer)) return false;
	const myBlockList = user.settings.get(UserSettings.Slayer.BlockedTasks) ?? [];
	if (myBlockList.includes(task.monster.id)) return false;
	const myUnlocks = user.settings.get(UserSettings.Slayer.SlayerUnlocks);
	// Slayer unlock restrictions:
	const lmon = task.monster.name.toLowerCase();
	const lmast = master.name.toLowerCase();
	if (lmon === 'red dragon' && !myUnlocks.includes(SlayerTaskUnlocksEnum.SeeingRed)) return false;
	if (lmon === 'mithril draogn' && !myUnlocks.includes(SlayerTaskUnlocksEnum.IHopeYouMithMe))
		return false;
	if (lmon === 'aviansie' && !myUnlocks.includes(SlayerTaskUnlocksEnum.WatchTheBirdie))
		return false;
	if (lmon === 'tzhaar-ket' && !myUnlocks.includes(SlayerTaskUnlocksEnum.HotStuff)) return false;
	if (lmon === 'spitting wyvern' && myUnlocks.includes(SlayerTaskUnlocksEnum.StopTheWyvern))
		return false;
	if (
		lmon === 'feral vampyre' &&
		(lmast === 'konar quo maten' ||
			lmast === 'duradel' ||
			lmast === 'nieve' ||
			lmast === 'chaeldar') &&
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

// boss tasks
export async function assignNewSlayerTask(_user: KlasaUser, master: SlayerMaster) {
	const baseTasks = [...master.tasks].filter(t => userCanUseTask(_user, t, master));
	let bossTask = false;
	if (
		_user.settings
			.get(UserSettings.Slayer.SlayerUnlocks)
			.includes(SlayerTaskUnlocksEnum.LikeABoss) &&
		(master.name.toLowerCase() === 'konar quo maten' ||
			master.name.toLowerCase() === 'duradel' ||
			master.name.toLowerCase() === 'nieve' ||
			master.name.toLowerCase() === 'chaeldar') &&
		roll(25)
	) {
		bossTask = true;
	}
	console.log(`Boss task? ${bossTask}.`);
	const assignedTask = bossTask ? weightedPick(bossTasks) : weightedPick(baseTasks);
	const newUser = await getNewUser(_user.id);

	const currentTask = new SlayerTaskTable();
	currentTask.user = newUser;
	currentTask.quantity = randInt(assignedTask.amount[0], assignedTask.amount[1]);
	currentTask.quantityRemaining = currentTask.quantity;
	currentTask.slayerMasterID = master.id;
	currentTask.monsterID = assignedTask.monster.id;
	currentTask.skipped = false;
	await currentTask.save();

	return { currentTask, assignedTask };
}
export function calcMaxBlockedTasks(qps: number) {
	// 6 Blocks total 5 for 250 qps, + 1 for lumby.
	// For now we're do 1 free + 1 for every 50 qps.
	return Math.min(1 + Math.floor(qps / 50), 6);
}
export function getCommonTaskName(task: Monster) {
	let commonName = task.name;
	switch (task.id) {
		case Monsters.KalphiteWorker.id:
			commonName = 'Kalphite';
			break;
		case Monsters.MountainTroll.id:
			commonName = 'Trolls';
			break;
		case Monsters.FossilIslandWyvernSpitting.id:
			commonName = 'Fossil Island Wyverns';
			break;
		case Monsters.FeralVampyre.id:
			commonName = 'Vampyres';
			break;
		case Monsters.ElfWarrior.id:
			commonName = 'Elves';
			break;
		case Monsters.SpiritualRanger.id:
			commonName = 'Spiritual Creatures';
			break;
		case Monsters.BlackBear.id:
			commonName = 'Bears';
			break;
		case Monsters.GuardDog.id:
			commonName = 'Dogs';
			break;
		default:
	}
	return commonName;
}
export async function getUsersCurrentSlayerInfo(id: string) {
	const [currentTask, totalTasksDone] = await Promise.all([
		SlayerTaskTable.findOne({
			where: {
				user: id,
				quantityRemaining: MoreThan(0),
				skipped: false
			}
		}),
		SlayerTaskTable.count({ where: { user: id, quantityRemaining: 0, skipped: false } })
	]);

	const slayerMaster = currentTask
		? slayerMasters.find(master => master.id === currentTask.slayerMasterID)
		: null;

	return {
		currentTask: currentTask ?? null,
		assignedTask: currentTask
			? slayerMaster!.tasks.find(m => m.monster.id === currentTask.monsterID)!
			: null,
		totalTasksDone,
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
	let name = '';
	SlayerRewardsShop.forEach(srs => {
		if (srs.id === id) name = srs.name;
	});
	return name;
}
export function hasSlayerUnlock(
	myUnlocks: SlayerTaskUnlocksEnum[] | number[],
	required: SlayerTaskUnlocksEnum[] | number[]
) {
	const missing: string[] = [];
	let success = true;
	let errors = '';

	console.log(`Required unlocks: ${required}`);
	required.forEach(req => {
		console.log(`Checking for req: ${req}  in ${myUnlocks}`);
		if (!myUnlocks.includes(req)) {
			success = false;
			console.log(`Missing requirement: req unlockReq: ${req}`);
			missing.push(getSlayerReward(req as SlayerTaskUnlocksEnum));
		}
	});

	console.log(`missing: ${missing}`);
	errors = missing.join(`, `);
	return { success, errors };
}
