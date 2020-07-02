import { Emoji } from '../constants';
import { ItemBank } from '../types';

export enum SkillsEnum {
	Agility = 'agility',
	Cooking = 'cooking',
	Fishing = 'fishing',
	Mining = 'mining',
	Smithing = 'smithing',
	Woodcutting = 'woodcutting',
	Firemaking = 'firemaking',
	Runecraft = 'runecraft',
	Crafting = 'crafting',
	Prayer = 'prayer',
	Fletching = 'fletching',
	Farming = 'farming',
	Herblore = 'herblore',
	Thieving = 'thieving'
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
	clueScrollChance?: number;
}

export interface Log {
	level: number;
	xp: number;
	id: number;
	name: string;
	respawnTime: number;
	petChance?: number;
	qpRequired: number;
	clueScrollChance?: number;
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
	clueScrollChance?: number;
}

export interface Course {
	id: number;
	name: string;
	level: number;
	xp: number;
	marksPer60?: number;
	lapTime: number;
	petChance: number;
	aliases: string[];
	qpRequired?: number;
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

export interface SmithedItem {
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
	crushChance?: number[];
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

export type LevelRequirements = Partial<
	{
		[key in SkillsEnum]: number;
	}
>;

export interface Skill {
	aliases: string[];
	id: SkillsEnum;
	emoji: Emoji;
	name: string;
}

export interface Plankable {
	name: string;
	inputItem: number;
	outputItem: number;
	gpCost: number;
}

export interface Plant {
	level: number;
	plantXp: number;
	checkXp: number;
	harvestXp: number;
	name: string;
	inputItems: ItemBank;
	aliases: string[];
	outputCrop?: number;
	outputLogs?: number;
	treeWoodcuttingLevel?: number;
	fixedOutputAmount?: number;
	variableYield?: boolean;
	variableOutputAmount?: [string, number, number][];
	woodcuttingXp?: number;
	needsChopForHarvest: boolean;
	fixedOutput: boolean;
	givesLogs: boolean;
	givesCrops: boolean;
	petChance: number;
	seedType: string;
	growthTime: number;
	numOfStages: number;
	chance1: number;
	chance99: number;
	chanceOfDeath: number;
	protectionPayment?: ItemBank;
	defaultNumOfPatches: number;
	canPayFarmer: boolean;
	canCompostPatch: boolean;
	canCompostandPay: boolean;
	additionalPatchesByQP: number[][];
	additionalPatchesByFarmLvl: number[][];
}
