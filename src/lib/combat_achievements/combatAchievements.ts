import { roll, sumArr } from 'e';

import { Requirements } from '../structures/Requirements';
import { ActivityTaskOptions } from '../types/minions';
import { assert } from '../util';
import { TripFinishEffect } from '../util/handleTripFinish';
import { easyCombatAchievements } from './easy';
import { hardCombatAchievements } from './hard';
import { mediumCombatAchievements } from './medium';

type CAType = 'kill_count' | 'mechanical' | 'perfection' | 'restriction' | 'speed' | 'stamina';

export type CombatAchievement = {
	id: number;
	name: string;
	type: CAType;
	desc: string;
} & (
	| { requirements: Requirements }
	| {
			rng: {
				chancePerKill: number;
				hasChance: (data: ActivityTaskOptions, user: MUser) => boolean;
			};
	  }
	| {
			customReq: (user: MUser) => Promise<boolean>;
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

export const combatAchievementTripEffect: TripFinishEffect['fn'] = async ({ user, data, messages }) => {
	const completedTasks = [];
	if (!('quantity' in data)) return;
	const quantity = Number(data.quantity);
	if (isNaN(quantity)) return;
	for (const task of indexesWithRng) {
		if (user.user.completed_ca_task_ids.includes(task.id)) continue;
		if (!('rng' in task)) continue;
		const hasChance = task.rng.hasChance(data, user);
		if (!hasChance) continue;
		for (let i = 0; i < quantity; i++) {
			if (roll(task.rng.chancePerKill)) {
				completedTasks.push(task);
			}
		}
	}

	if (completedTasks.length === 0) return;

	await user.update({
		completed_ca_task_ids: {
			push: completedTasks.map(t => t.id)
		}
	});

	messages.push(
		`You completed the ${completedTasks.map(i => i.name).join(', ')} Combat Achievement Task${
			completedTasks.length > 1 ? 's' : ''
		}!`
	);
};

export function caToPlayerString(task: CombatAchievement, user: MUser) {
	if (user.user.completed_ca_task_ids.includes(task.id)) {
		return `Completed ✅ ${task.name} - ${task.desc}`;
	}
	return `Incomplete ❌ ${task.name} - ${task.desc}`;
}
