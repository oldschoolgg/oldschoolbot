import { sumArr } from 'e';

import { Requirements } from '../structures/Requirements';
import { ActivityTaskOptions, MonsterActivityTaskOptions } from '../types/minions';
import { assert } from '../util';
import { easyCombatAchievements } from './easy';

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
				hasChance: (data: ActivityTaskOptions) => boolean;
			};
	  }
);

export function isCertainMonsterTrip(monsterID: number) {
	return (data: ActivityTaskOptions) =>
		data.type === 'MonsterKilling' && (data as MonsterActivityTaskOptions).monsterID === monsterID;
}

export const CombatAchievements = {
	easy: {
		tasks: easyCombatAchievements,
		length: 33
	}
};

for (const [, val] of Object.entries(CombatAchievements)) {
	assert(val.tasks.length === val.length);
}

const allCATaskIDs = Object.values(CombatAchievements)
	.map(i => i.tasks.map(t => t.id))
	.flat();
assert(allCATaskIDs.length === new Set(allCATaskIDs).size);
assert(sumArr(Object.values(CombatAchievements).map(i => i.length)) === allCATaskIDs.length);
