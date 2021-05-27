import { Item } from 'oldschooljs/dist/meta/types';

export interface AssignableSlayerTask {
	name: string;
	amount: [number, number];
	weight: number;
	id: number[];
	slayerLevel?: number;
	combatLevel?: number;
	alternatives?: string[];
	questPoints?: number;
	unlocked?: boolean;
}

export interface SlayerMaster {
	name: string;
	aliases: string[];
	tasks: AssignableSlayerTask[];
	bossTasks?: true;
	masterId: number;
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
