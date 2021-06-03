import { randFloat, randInt } from 'e';
import { KlasaUser } from 'klasa';
import { MoreThanOrEqual } from 'typeorm';

import { getNewUser } from '../settings/settings';
import { UserSettings } from '../settings/types/UserSettings';
import { SkillsEnum } from '../skilling/types';
import { SlayerTaskTable } from '../typeorm/SlayerTaskTable.entity';
import { slayerMasters } from './slayerMasters';
import { AssignableSlayerTask, SlayerMaster } from './types';

export function streakPoints(currentStreak: number, master: SlayerMaster) {
	const streaks = [1000, 250, 100, 50, 10];
	const multiplier = [50, 35, 25, 15, 5];

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

export function userCanUseTask(user: KlasaUser, task: AssignableSlayerTask) {
	if (task.combatLevel && task.combatLevel > user.combatLevel) return false;
	if (task.questPoints && task.questPoints > user.settings.get(UserSettings.QP)) return false;
	if (task.slayerLevel && task.slayerLevel > user.skillLevel(SkillsEnum.Slayer)) return false;
	return true;
}

// boss tasks
export async function assignNewSlayerTask(_user: KlasaUser, master: SlayerMaster) {
	const baseTasks = [...master.tasks].filter(t => userCanUseTask(_user, t));
	const assignedTask = weightedPick(baseTasks);
	const newUser = await getNewUser(_user.id);

	const currentTask = new SlayerTaskTable();
	currentTask.user = newUser;
	currentTask.quantity = randInt(assignedTask.amount[0], assignedTask.amount[1]);
	currentTask.quantityRemaining = currentTask.quantity;
	currentTask.slayerMasterID = master.id;
	currentTask.monsterID = assignedTask.monster.id;
	await currentTask.save();

	return { currentTask, assignedTask };
}

export async function getUsersCurrentSlayerInfo(id: string) {
	const [currentTask, totalTasksDone] = await Promise.all([
		SlayerTaskTable.findOne({
			where: {
				user: id,
				quantityRemaining: MoreThanOrEqual(0)
			}
		}),
		SlayerTaskTable.count({ where: { user: id, quantityRemaining: 0 } })
	]);

	return {
		currentTask: currentTask ?? null,
		assignedTask: currentTask
			? slayerMasters
					.find(master => master.id === currentTask.slayerMasterID)!
					.tasks.find(m => m.monster.id === currentTask.monsterID)!
			: null,
		totalTasksDone
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
