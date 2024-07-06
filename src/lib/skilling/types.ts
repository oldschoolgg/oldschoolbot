import type { Bank } from 'oldschooljs';
import type { Item } from 'oldschooljs/dist/meta/types';
import type LootTable from 'oldschooljs/dist/structures/LootTable';


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
	Dungeoneering = 'dungeoneering',
	Slayer = 'slayer',
	Invention = 'invention',
	Divination = 'divination'
}

export const SkillsArray = [
	'agility',
	'cooking',
	'fishing',
	'mining',
	'smithing',
	'woodcutting',
	'firemaking',
	'runecraft',
	'crafting',
	'prayer',
	'fletching',
	'farming',
	'herblore',
	'thieving',
	'hunter',
	'construction',
	'magic',
	'attack',
	'strength',
	'defence',
	'ranged',
	'hitpoints',
	'dungeoneering',
	'slayer',
	'invention',
	'divination'
] as const;

export type SkillNameType = (typeof SkillsArray)[number];
for (const skill of SkillsArray) {
	const matching = Object.keys(SkillsEnum).find(key => key.toLowerCase() === skill);
	if (!matching) throw new Error(`Missing skill enum for ${skill}`);
}
if (SkillsArray.length !== Object.keys(SkillsEnum).length) {
	throw new Error('Not all skills have been added to the SkillsArray.');
}

export const SkillsArray = [
	'agility',
	'cooking',
	'fishing',
	'mining',
	'smithing',
	'woodcutting',
	'firemaking',
	'runecraft',
	'crafting',
	'prayer',
	'fletching',
	'farming',
	'herblore',
	'thieving',
	'hunter',
	'construction',
	'magic',
	'attack',
	'strength',
	'defence',
	'ranged',
	'hitpoints',
	'slayer'
] as const;

export type SkillNameType = (typeof SkillsArray)[number];
for (const skill of SkillsArray) {
	const matching = Object.keys(SkillsEnum).find(key => key.toLowerCase() === skill);
	if (!matching) throw new Error(`Missing skill enum for ${skill}`);
}
if (SkillsArray.length !== Object.keys(SkillsEnum).length) {
	throw new Error('Not all skills have been added to the SkillsArray.');
}

export interface Ore {
	level: number;
	xp: number;
	id: number;
	name: string;
	respawnTime: number;
	bankingTime: number;
	slope: number;
	intercept: number;
	petChance?: number;
	minerals?: number;
	clueScrollChance?: number;
	requiredPickaxes?: number[];
	aliases?: string[];
}

export interface Log {
	level: number;
	xp: number;
	id: number;
	lootTable?: LootTable;
	name: string;
	leaf?: number;
	aliases?: string[];
	findNewTreeTime: number;
	bankingTime: number;
	slope: number;
	intercept: number;
	depletionChance: number;
	wcGuild?: boolean;
	petChance?: number;
	qpRequired: number;
	clueScrollChance?: number;
	customReq?: (user: MUser) => string | undefined;
	hasNoLoot?: true;
	clueNestsOnly?: boolean;
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
	xp: number | ((agilityLevel: number) => number);
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
	// Burn level with hosidius/diary: [ noGauntletsHosidius, noGauntletsElite, gauntletsHosidius, gauntletsElite ]
	burnKourendBonus?: number[];
	burntCookable: number;
	alias?: string[];
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
	timeToUse: number;
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
	requiresBlacksmith?: boolean;
	cantBeDoubled?: boolean;
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
	otherSkillRequirements?: Partial<Skills>;
	qpRequired?: number;
	wcLvl?: number;
	cantBeDoubled?: boolean;
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
	craftingXp?: number;
}

export interface Mixable {
	item: Item;
	aliases: string[];
	level: number;
	xp: number;
	inputItems: Bank;
	tickRate: number;
	bankTimePerPotion: number;
	outputMultiple?: number;
	zahur?: boolean;
	wesley?: boolean;
	qpRequired?: number;
	defaultQuantity?: number;
}

export interface CutLeapingFish {
	item: Item;
	aliases: string[];
	tickRate: number;
}

export interface Bone {
	level: number;
	xp: number;
	name: string;
	inputId: number;
}

export interface Ash {
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
	emoji: string;
	name: string;
}

export interface Plankable {
	name: string;
	inputItem: number;
	outputItem: number;
	gpCost: number;
}

export interface Plant {
	id: number;
	level: number;
	plantXp: number;
	checkXp: number;
	harvestXp: number;
	name: string;
	inputItems: Bank;
	aliases: string[];
	outputCrop?: number;
	cleanHerbCrop?: number;
	herbXp?: number;
	herbLvl?: number;
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
	seedType: FarmingPatchName;
	growthTime: number;
	numOfStages: number;
	chance1: number;
	chance99: number;
	chanceOfDeath: number;
	protectionPayment?: Bank;
	defaultNumOfPatches: number;
	canPayFarmer: boolean;
	canCompostPatch: boolean;
	canCompostandPay: boolean;
	additionalPatchesByQP: number[][];
	additionalPatchesByFarmLvl: number[][];
	additionalPatchesByFarmGuildAndLvl: number[][];
	timePerPatchTravel: number;
	timePerHarvest: number;
	onHarvest?: (options: { user: MUser; loot: Bank; quantity: number; messages: string[] }) => Promise<unknown>;
	noArcaneHarvester?: boolean;
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
	bait?: (quantity: number) => Bank;
}
