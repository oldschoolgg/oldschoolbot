import { activity_type_enum } from '@prisma/client';
import { deepClone, notEmpty, roll, sumArr } from 'e';

import { Requirements } from '../structures/Requirements';
import { ActivityTaskData, TOAOptions } from '../types/minions';
import { assert } from '../util';
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

export const CombatAchievements = {
	easy: {
		tasks: easyCombatAchievements,
		length: 33,
		name: 'Easy'
	},
	medium: {
		tasks: mediumCombatAchievements,
		length: 41,
		name: 'Medium'
	},
	hard: {
		tasks: hardCombatAchievements,
		length: 63,
		name: 'Hard'
	},
	elite: {
		tasks: eliteCombatAchievements,
		length: 129,
		name: 'Elite'
	},
	master: {
		tasks: masterCombatAchievements,
		length: 129,
		name: 'Master'
	},
	grandmaster: {
		tasks: grandmasterCombatAchievements,
		length: 90,
		name: 'Grandmaster'
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
	if (dataCopy.type === 'TheatreOfBlood') {
		(dataCopy as any).quantity = 1;
	}
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
		if (data.wipedRoom) {
			quantity--;
		} else if (data.wipedRooms) {
			quantity -= sumArr(data.wipedRooms.map(i => (i ? i : 0)));
		}
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

		taskLoop: for (const task of indexesWithRng) {
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
					break taskLoop;
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
