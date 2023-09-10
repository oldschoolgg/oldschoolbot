import { activity_type_enum } from '@prisma/client';
import { deepClone, notEmpty, roll, sumArr } from 'e';
import { Item } from 'oldschooljs/dist/meta/types';

import { Requirements } from '../structures/Requirements';
import { ActivityTaskData, TOAOptions } from '../types/minions';
import { assert } from '../util';
import getOSItem from '../util/getOSItem';
import { TripFinishEffect } from '../util/handleTripFinish';
import { easyCombatAchievements } from './easy';
import { eliteCombatAchievements } from './elite';
import { grandmasterCombatAchievements } from './grandmaster';
import { hardCombatAchievements } from './hard';
import { masterCombatAchievements } from './master';
import { mediumCombatAchievements } from './medium';

type CAType = 'kill_count' | 'mechanical' | 'perfection' | 'restriction' | 'speed' | 'stamina';

export type CombatAchievement = {
	id: number;
	name: string;
	type: CAType;
	monster: string;
	desc: string;
	activityType?: activity_type_enum;
} & (
	| { requirements: Requirements }
	| {
			rng: {
				chancePerKill: number;
				hasChance: activity_type_enum | ((data: ActivityTaskData, user: MUser) => boolean);
			};
	  }
	| {
			notPossible: true;
	  }
);

interface CARootItem {
	name: 'Easy' | 'Medium' | 'Hard' | 'Elite' | 'Master' | 'Grandmaster';
	length: number;
	tasks: CombatAchievement[];
	staticRewards: { item: Item; reclaimable: boolean }[];
}
type CARoot = Record<'easy' | 'medium' | 'hard' | 'elite' | 'master' | 'grandmaster', CARootItem>;

export const CombatAchievements: CARoot = {
	easy: {
		tasks: easyCombatAchievements,
		length: 33,
		name: 'Easy',
		staticRewards: [
			{ item: getOSItem("Ghommal's hilt 1"), reclaimable: true },
			{ item: getOSItem('Antique lamp (easy ca)'), reclaimable: false }
		]
	},
	medium: {
		tasks: mediumCombatAchievements,
		length: 41 - 1,
		name: 'Medium',
		staticRewards: [
			{ item: getOSItem("Ghommal's hilt 2"), reclaimable: true },
			{ item: getOSItem('Antique lamp (medium ca)'), reclaimable: false }
		]
	},
	hard: {
		tasks: hardCombatAchievements,
		length: 63,
		name: 'Hard',
		staticRewards: [
			{ item: getOSItem("Ghommal's hilt 3"), reclaimable: true },
			{ item: getOSItem('Antique lamp (hard ca)'), reclaimable: false }
		]
	},
	elite: {
		tasks: eliteCombatAchievements,
		length: 129 - 6,
		name: 'Elite',
		staticRewards: [
			{ item: getOSItem("Ghommal's hilt 4"), reclaimable: true },
			{ item: getOSItem('Antique lamp (elite ca)'), reclaimable: false }
		]
	},
	master: {
		tasks: masterCombatAchievements,
		length: 129 - 5,
		name: 'Master',
		staticRewards: [
			{ item: getOSItem("Ghommal's hilt 5"), reclaimable: true },
			{ item: getOSItem("Ghommal's lucky penny"), reclaimable: true },
			{ item: getOSItem('Antique lamp (master ca)'), reclaimable: false }
		]
	},
	grandmaster: {
		tasks: grandmasterCombatAchievements,
		length: 90 - 3,
		name: 'Grandmaster',
		staticRewards: [
			{ item: getOSItem("Ghommal's hilt 6"), reclaimable: true },
			{ item: getOSItem('Antique lamp (grandmaster ca)'), reclaimable: false }
		]
	}
};

const entries = Object.entries(CombatAchievements);

for (const [, val] of entries) {
	assert(val.tasks.length === val.length, `${val.name} has ${val.tasks.length} tasks, but length is ${val.length}`);
}

export const allCombatAchievementTasks = entries.map(i => i[1].tasks).flat();

const allCATaskIDs = entries.map(i => i[1].tasks.map(t => t.id)).flat();
assert(allCATaskIDs.length === new Set(allCATaskIDs).size);
assert(sumArr(Object.values(CombatAchievements).map(i => i.length)) === allCATaskIDs.length);
const indexesWithRng = entries.map(i => i[1].tasks.filter(t => 'rng' in t)).flat();

export const combatAchievementTripEffect: TripFinishEffect['fn'] = async ({ data, messages }) => {
	const dataCopy = deepClone(data);
	if (dataCopy.type === 'Inferno' && !dataCopy.diedPreZuk && !dataCopy.diedZuk) {
		(dataCopy as any).quantity = 1;
	}
	if (!('quantity' in dataCopy)) return;
	let quantity = Number(dataCopy.quantity);
	if (isNaN(quantity)) return;

	if (data.type === 'TombsOfAmascut') {
		const wipedRoom = (data as TOAOptions).wipedRoom ?? 0;
		const wipedRooms = (Array.isArray(wipedRoom) ? wipedRoom : [wipedRoom]).filter(notEmpty);
		for (let i = 0; i < wipedRooms.length; i++) quantity--;
	} else if (data.type === 'TheatreOfBlood') {
		quantity -= sumArr(data.wipedRooms.map(i => (i !== null ? 1 : 0)));
	} else if (data.type === 'FightCaves') {
		if (data.preJadDeathTime) {
			quantity--;
		}
	}

	const users = await Promise.all(
		('users' in data ? (data.users as string[]) : [data.userID]).map(id => mUserFetch(id))
	);

	for (const user of users) {
		const completedTasks = [];

		for (const task of indexesWithRng) {
			if (user.user.completed_ca_task_ids.includes(task.id)) continue;
			if (!('rng' in task)) continue;

			const hasChance =
				typeof task.rng.hasChance === 'string'
					? dataCopy.type === task.rng.hasChance
					: task.rng.hasChance(dataCopy, user);
			if (!hasChance) continue;

			for (let i = 0; i < quantity; i++) {
				if (roll(task.rng.chancePerKill)) {
					completedTasks.push(task);
				}
			}
		}

		if (completedTasks.length > 0) {
			messages.push(
				`${users.length === 1 ? 'You' : `${user}`} completed the ${completedTasks
					.map(i => i.name)
					.join(', ')} Combat Achievement Task${completedTasks.length > 1 ? 's' : ''}!`
			);
			await user.update({
				completed_ca_task_ids: {
					push: completedTasks.map(t => t.id)
				}
			});
		}
	}
};

export function caToPlayerString(task: CombatAchievement, user: MUser) {
	if (user.user.completed_ca_task_ids.includes(task.id)) {
		return `Completed ✅ ${task.name} - ${task.desc}`;
	}
	if ('notPossible' in task) {
		return `Not Possible ❌ ${task.name} - ${task.desc}`;
	}
	return `Incomplete ❌ ${task.name} - ${task.desc}`;
}
