export const enum SkillsEnum {
	Agility = 'agility',
	Fishing = 'fishing',
	Mining = 'mining',
	Smithing = 'smithing',
	Woodcutting = 'woodcutting',
	Firemaking = 'firemaking',
	Runecraft = 'runecraft'
}

export interface Ore {
	level: number;
	xp: number;
	id: number;
	name: string;
	respawnTime: number;
	petChance?: number;
	nuggets?: boolean;
	minerals?: number;
}

export interface Bar {
	level: number;
	xp: number;
	id: number;
	name: string;
	inputOres: Bank;
	/**
	 * Chance that the ore will fail to smelt (i.e iron), out of 100
	 */
	chanceOfFail: number;
}

export interface Log {
	level: number;
	xp: number;
	id: number;
	name: string;
	respawnTime: number;
	petChance?: number;
	qpRequired: number;
}

export interface Burnable {
	level: number;
	xp: number;
	name: string;
	inputLogs: number;
}

export interface Fish {
	level: number;
	xp: number;
	id: number;
	name: string;
	petChance: number;
	timePerFish: number;
	bait?: number;
	qpRequired?: number;
	bigFish?: number;
	bigFishRate?: number;
}

export interface Course {
	name: string;
	level: number;
	xp: number;
	marksPer60?: number;
	lapTime: number;
	petChance: number;
	aliases: string[];
}

export interface Rune {
	levels: number[][];
	xp: number;
	id: number;
	name: string;
	qpRequired?: number;
	tripLength: number;
}
