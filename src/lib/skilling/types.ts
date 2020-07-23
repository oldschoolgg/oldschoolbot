import { ItemBank } from '../types';

export enum SkillsEnum {
	Agility = 'agility',
	Attack = 'attack',
	Cooking = 'cooking',
	Defence = 'defence',
	Fishing = 'fishing',
	Hitpoints = 'Hitpoints',
	Magic = 'magic',
	Mining = 'mining',
	Prayer = 'prayer',
	Range = 'range',
	Slayer = 'slayer',
	Smithing = 'smithing',
	Strength = 'strength',
	Woodcutting = 'woodcutting',
	Firemaking = 'firemaking',
	Runecraft = 'runecraft',
	Crafting = 'crafting',
	Prayer = 'prayer',
	Fletching = 'fletching',
	Farming = 'farming',
	Herblore = 'herblore'
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
	inputOres: ItemBank;
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

export interface Cookable {
	level: number;
	xp: number;
	id: number;
	name: string;
	inputCookables: ItemBank;
	stopBurnAt: number;
	stopBurnAtCG: number;
	burntCookable: number;
}

export interface Eatable {
	name: string;
	id: number;
	healAmount: number;
}

export interface SmithedBar {
	level: number;
	xp: number;
	id: number;
	name: string;
	inputBars: ItemBank;
	timeToUse: number;
	outputMultiple: number;
}

export interface Craftable {
	name: string;
	id: number;
	level: number;
	xp: number;
	inputItems: ItemBank;
	tickRate: number;
}

export interface Fletchable {
	name: string;
	id: number;
	level: number;
	xp: number;
	inputItems: ItemBank;
	tickRate: number;
	outputMultiple?: number;
}

export interface Bone {
	level: number;
	xp: number;
	name: string;
	inputId: number;
}

export interface Task {
	name: string;
	amount: number | number[];
	extendedAmount?: number | number[];
	weight: number;
	alternatives?: string | string[];
	Id: number | number[];
	combatLvl?: number;
	slayerLvl?: number;
	wilderness?: number;
	unlocked?: boolean;
}

export type LevelRequirements = Partial<
	{
		[key in SkillsEnum]: number;
	}
>;
