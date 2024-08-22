import type { MonsterSlayerMaster } from 'oldschooljs';
import type { Item } from 'oldschooljs/dist/meta/types';
import type Monster from 'oldschooljs/dist/structures/Monster';

import type { LevelRequirements } from '../skilling/types';

export interface AssignableSlayerTask {
	monster: Monster;
	amount: [number, number];
	weight: number;
	monsters: number[];
	slayerLevel?: number;
	combatLevel?: number;
	questPoints?: number;
	unlocked?: boolean;
	isBoss?: boolean;
	levelRequirements?: LevelRequirements;
	dontAssign?: boolean;
	extendedAmount?: [number, number];
	extendedUnlockId?: number;
	wilderness?: boolean;
	dungeoneeringLevel?: number;
}

export interface SlayerMaster {
	id: number;
	name: string;
	aliases: string[];
	tasks: AssignableSlayerTask[];
	bossTasks?: true;
	basePoints: number;
	combatLvl?: number;
	slayerLvl?: number;
	questPoints?: number;
	osjsEnum: MonsterSlayerMaster;
}

export interface SlayerShopItem {
	item: Item;
	alias?: string;
	itemAmount?: number;
	points: number;
}
