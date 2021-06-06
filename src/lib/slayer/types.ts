import { Item } from 'oldschooljs/dist/meta/types';
import Monster from 'oldschooljs/dist/structures/Monster';

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
}

export interface SlayerShopItem {
	item: Item;
	alias?: string;
	itemAmount?: number;
	points: number;
}
