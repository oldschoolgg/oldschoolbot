import type { Image } from '@napi-rs/canvas';
import type { PerkTier, StoreBitfield } from '@oldschoolgg/toolkit';
import type { GearSetupType, XpGainSource } from '@prisma/client';
import type { Bank, MonsterKillOptions } from 'oldschooljs';
import type { Item, ItemBank } from 'oldschooljs/dist/meta/types';
import type SimpleMonster from 'oldschooljs/dist/structures/SimpleMonster';

import type { ClueTier } from '../clues/clueTiers';
import type { BitField } from '../constants';
import type { GearStat, OffenceGearStat } from '../gear';
import type { POHBoosts } from '../poh';
import type { MinigameName } from '../settings/minigames';
import type { LevelRequirements, SkillsEnum } from '../skilling/types';
import type { XPBank } from '../structures/Bank';
import type { GearBank } from '../structures/GearBank';
import type { MUserStats } from '../structures/MUserStats';
import type { ArrayItemsResolved, Skills } from '../types';
import type { calculateSimpleMonsterDeathChance } from '../util';
import type { BSOMonsters } from './data/killableMonsters/custom/customMonsters';
import type { QuestID } from './data/quests';
import type { AttackStyles } from './functions';

export type KillableMonsterEffect = (opts: {
	gearBank: GearBank;
	quantity: number;
	monster: KillableMonster;
	loot: Bank;
}) => void | { xpBank?: XPBank; loot?: Bank; messages: string[] };

export type BankBackground = {
	image: Image | null;
	id: number;
	name: string;
	available: boolean;
	collectionLogItemsNeeded?: Bank;
	perkTierNeeded?: PerkTier;
	gpCost?: number;
	itemCost?: Bank;
	repeatImage?: Image | null;
	bitfield?: BitField;
	sacValueRequired?: number;
	skillsNeeded?: Skills;
	transparent?: true;
	owners?: string[];
	alternateImages?: { id: number }[];
	storeBitField?: StoreBitfield;
} & (
	| {
			hasPurple: true;
			purpleImage: Image | null;
	  }
	| {
			hasPurple?: null;
	  }
);

export type GearRequirement = Partial<{ [key in GearStat]: number }>;
export type GearRequirements = Partial<{ [key in GearSetupType]: GearRequirement }>;

export interface KillableMonster {
	id: number;
	name: string;
	aliases: string[];
	timeToFinish: number;
	table: {
		kill(quantity: number, options: MonsterKillOptions): Bank;
	};
	emoji?: string;

	/**
	 * Wilderness variables.
	 */
	wildy?: boolean;
	wildyMulti?: boolean;
	canBePked?: boolean;
	pkActivityRating?: number;
	pkBaseDeathChance?: number;

	itemsRequired?: ArrayItemsResolved;
	notifyDrops?: ArrayItemsResolved;
	existsInCatacombs?: boolean;
	qpRequired?: number;
	difficultyRating?: number;
	revsWeaponBoost?: boolean;

	/**
	 * An array of objects of ([key: itemID]: boostPercentage) boosts that apply to
	 * this monster. For each set, only the item with the greatest boost (that the user also possesses)
	 * will be used as boost.
	 */
	itemInBankBoosts?: ItemBank[];
	/**
	 * Whether or not this monster can be groupkilled.
	 */
	groupKillable?: boolean;
	respawnTime?: number;
	levelRequirements?: LevelRequirements;
	uniques?: ArrayItemsResolved;
	/**
	 * How much healing (health points restored) is needed per kill.
	 */
	healAmountNeeded?: number;
	attackStyleToUse?: OffenceGearStat;
	attackStylesUsed?: OffenceGearStat[];
	/**
	 * The minimum *required* gear stats to fight this monster.
	 */
	minimumGearRequirements?: GearRequirements;
	/**
	 * Boosts for POH objects.
	 */
	pohBoosts?: POHBoosts;
	defaultAttackStyles?: AttackStyles[];
	disallowedAttackStyles?: AttackStyles[];
	customMonsterHP?: number;
	combatXpMultiplier?: number;
	itemCost?: Consumable;
	superior?: SimpleMonster;
	slayerOnly?: boolean;
	canChinning?: boolean;
	canBarrage?: boolean;
	canCannon?: boolean;
	cannonMulti?: boolean;
	specialLoot?: (data: { loot: Bank; ownedItems: Bank; quantity: number; cl: Bank }) => void;
	effect?: KillableMonsterEffect;
	degradeableItemUsage?: {
		required: boolean;
		gearSetup: GearSetupType;
		items: { boostPercent: number; itemID: number }[];
	}[];
	projectileUsage?: {
		requiredAmmo?: number[];
		required: boolean;
		calculateQuantity: (opts: { quantity: number }) => number;
	};
	equippedItemBoosts?: {
		gearSetup: GearSetupType;
		items: { boostPercent: number; itemID: number }[];
	}[];
	requiredQuests?: QuestID[];
	deathProps?: Omit<Parameters<typeof calculateSimpleMonsterDeathChance>['0'], 'currentKC'>;
	diaryRequirement?: [DiaryID, DiaryTierName];
	wildySlayerCave?: boolean;
	requiredBitfield?: BitField;

	minimumFoodHealAmount?: number;
	minimumWeaponShieldStats?: Partial<Record<GearSetupType, Required<GearRequirement>>>;
	tameCantKill?: true;
	customRequirement?: (user: MUser) => Promise<string | null>;
	setupsUsed?: GearSetupType[];
	kcRequirements?: Partial<Record<keyof typeof BSOMonsters, number>>;
	maxQuantity?: number;
}
/*
 * Monsters will have an array of Consumables
 * Math.ceil(duration / Time.Minute * qtyPerMinute)
 * Or quantity * qtyPerKill.
 */
export interface Consumable {
	itemCost: Bank;
	qtyPerMinute?: number;
	qtyPerKill?: number;
	// For staff of the dead / kodai
	isRuneCost?: boolean;
	alternativeConsumables?: Consumable[];
}

export interface AddXpParams {
	skillName: SkillsEnum;
	amount: number;
	duration?: number;
	multiplier?: boolean;
	minimal?: boolean;
	artificial?: boolean;
	masterCapeBoost?: boolean;
	source?: XpGainSource;
}

export interface AddMonsterXpParams {
	monsterID: number;
	quantity: number;
	duration: number;
	isOnTask: boolean;
	taskQuantity: number | null;
	minimal?: boolean;
	usingCannon?: boolean;
	cannonMulti?: boolean;
	burstOrBarrage?: number;
	superiorCount?: number;
}

export interface BlowpipeData {
	scales: number;
	dartQuantity: number;
	dartID: number | null;
}

export interface MegaDuckLocation {
	x: number;
	y: number;
	placesVisited: string[];
	usersParticipated: Record<string, number>;
	steps: [number, number][];
}

export const defaultMegaDuckLocation: Readonly<MegaDuckLocation> = {
	x: 1356,
	y: 209,
	usersParticipated: {},
	placesVisited: [],
	steps: []
};
export type Flags = Record<string, string | number>;
export type FlagMap = Map<string, string | number>;
export type ClueBank = Record<ClueTier['name'], number>;

export const diaryTiers = ['easy', 'medium', 'hard', 'elite'] as const;
export type DiaryTierName = (typeof diaryTiers)[number];

export interface DiaryTier {
	name: 'Easy' | 'Medium' | 'Hard' | 'Elite';
	items: Item[];
	skillReqs: Skills;
	ownedItems?: number[];
	collectionLogReqs?: number[];
	minigameReqs?: Partial<Record<MinigameName, number>>;
	lapsReqs?: Record<string, number>;
	qp?: number;
	monsterScores?: Record<string, number>;
	customReq?: (user: MUser, summary: boolean, stats: MUserStats) => [true] | [false, string];
}
export enum DiaryID {
	WesternProvinces = 0,
	Ardougne = 1,
	Desert = 2,
	Falador = 3,
	Fremennik = 4,
	Kandarin = 5,
	Karamja = 6,
	KourendKebos = 7,
	LumbridgeDraynor = 8,
	Morytania = 9,
	Varrock = 10,
	Wilderness = 11
}
