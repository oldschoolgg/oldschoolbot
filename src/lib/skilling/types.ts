import { Bank } from 'oldschooljs';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { Emoji } from '../constants';
import { SlayerTaskUnlocksEnum } from '../slayer/slayerUnlocks';
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
	Thieving = 'thieving',
	Hunter = 'hunter',
	Construction = 'construction',
	Magic = 'magic',
	Attack = 'attack',
	Strength = 'strength',
	Defence = 'defence',
	Ranged = 'ranged',
	Hitpoints = 'hitpoints',
	Slayer = 'slayer'
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
	aliases?: string[];
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
	petChance?: number;
	timePerFish: number;
	bait?: number;
	qpRequired?: number;
	bigFish?: number;
	bigFishRate?: number;
	clueScrollChance?: number;
	alias?: string[];
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

export interface Cookable {
	level: number;
	xp: number;
	id: number;
	name: string;
	inputCookables: ItemBank;
	stopBurnAt: number;
	stopBurnAtCG?: number;
	burntCookable: number;
	alias?: string[];
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

export interface BlastableBar {
	level: number;
	xp: number;
	id: number;
	name: string;
	inputOres: Bank;
	timeToUse: number;
}

export interface SmithedItem {
	level: number;
	xp: number;
	id: number;
	name: string;
	inputBars: ItemBank;
	timeToUse: number;
	outputMultiple: number;
	qpRequired?: number;
}

export interface Craftable {
	name: string;
	alias?: string[];
	id: number;
	level: number;
	xp: number;
	inputItems: Bank;
	tickRate: number;
	crushChance?: number[];
	bankChest?: boolean;
	outputMultiple?: number;
}

export interface Fletchable {
	name: string;
	id: number;
	level: number;
	xp: number;
	inputItems: Bank;
	tickRate: number;
	outputMultiple?: number;
	requiredSlayerUnlocks?: SlayerTaskUnlocksEnum[];
}

export interface Mixable {
	name: string;
	aliases: string[];
	id: number;
	level: number;
	xp: number;
	inputItems: ItemBank;
	tickRate: number;
	bankTimePerPotion: number;
	outputMultiple?: number;
	zahur?: boolean;
	wesley?: boolean;
	qpRequired?: number;
}

export interface Bone {
	level: number;
	xp: number;
	name: string;
	inputId: number;
}

export type LevelRequirements = Partial<{
	[key in SkillsEnum]: number;
}>;

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
	outputRoots?: number;
	treeWoodcuttingLevel?: number;
	fixedOutputAmount?: number;
	variableYield?: boolean;
	variableOutputAmount?: [string | null, number, number][];
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
	additionalPatchesByFarmGuildAndLvl: number[][];
	timePerPatchTravel: number;
	timePerHarvest: number;
}

export enum HunterTechniqueEnum {
	AerialFishing = 'aerial fishing',
	DriftNet = 'drift net fishing',
	BirdSnaring = 'bird snaring',
	BoxTrapping = 'box trapping',
	ButterflyNetting = 'butterfly netting',
	DeadfallTrapping = 'deadfall trapping',
	Falconry = 'falconry',
	MagicBoxTrapping = 'magic box trapping',
	NetTrapping = 'net trapping',
	PitfallTrapping = 'pitfall trapping',
	RabbitSnaring = 'rabbit snaring',
	Tracking = 'tracking'
}

export interface Creature {
	name: string;
	id: number;
	aliases: string[];
	level: number;
	hunterXP: number;
	fishLvl?: number;
	fishingXP?: number;
	itemsRequired?: Bank;
	itemsConsumed?: Bank;
	table: LootTable;
	huntTechnique: HunterTechniqueEnum;
	multiTraps?: boolean;
	wildy?: boolean;
	prayerLvl?: number;
	herbloreLvl?: number;
	catchTime: number;
	qpRequired?: number;
	slope: number;
	intercept: number;
}
