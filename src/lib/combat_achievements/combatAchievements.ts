import { sumArr } from 'e';

import { MinigameName } from '../settings/minigames';
import { ActivityTaskOptions } from '../types/minions';
import { assert } from '../util';
import { easyCombatAchievements } from './easy';

type CAType = 'kill_count' | 'mechanical' | 'perfection' | 'restriction' | 'speed' | 'stamina';

export interface CombatAchievement {
	id: number;
	name: string;
	type: CAType;
	desc: string;
	kcReq?: {
		monsterID: number;
		qty: number;
	};
	minigameReq?: {
		minigame: MinigameName;
		qty: number;
	};
	chance?: (data: ActivityTaskOptions) => number;
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
