import type { StoreBitfield } from '@oldschoolgg/toolkit/util';
import type { XpGainSource } from '@prisma/client';
import type { Bank, Item, MonsterKillOptions, SimpleMonster } from 'oldschooljs';

import type { ClueTier } from '../clues/clueTiers';
import type { BitField, PerkTier } from '../constants';
import type { GearSetupType, GearStat, OffenceGearStat } from '../gear/types';
import type { POHBoosts } from '../poh';
import type { MinigameName } from '../settings/minigames';
import type { LevelRequirements, SkillsEnum } from '../skilling/types';
import type { XPBank } from '../structures/Bank';
import type { GearBank } from '../structures/GearBank';
import type { MUserStats } from '../structures/MUserStats';
import type { UpdateBank } from '../structures/UpdateBank';
import type { ItemBank, Skills } from '../types';
import type { ArrayItemsResolved, calculateSimpleMonsterDeathChance } from '../util';
import type { CanvasImage } from '../util/canvasUtil';
import type { QuestID } from './data/quests';
import type { AttackStyles } from './functions';

export type KillableMonsterEffect = (opts: {
	gearBank: GearBank;
	quantity: number;
	monster: KillableMonster;
	loot: Bank;
	updateBank: UpdateBank;
}) => void | { xpBank?: XPBank; loot?: Bank; messages: string[] };

export type BankBackground = {
	image: CanvasImage | null;
	id: number;
	name: string;
	available: boolean;
	collectionLogItemsNeeded?: Bank;
	perkTierNeeded?: PerkTier;
	gpCost?: number;
	itemCost?: Bank;
	repeatImage?: CanvasImage | null;
	bitfield?: BitField;
	sacValueRequired?: number;
	skillsNeeded?: Skills;
	transparent?: true;
	alternateImages?: { id: number }[];
	storeBitField?: StoreBitfield;
} & (
	| {
			hasPurple: true;
			purpleImage: CanvasImage | null;
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
	minimumHealAmount?: number;
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
	itemCost?: Consumable | Consumable[];
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
		required: boolean;
		calculateQuantity: (opts: { quantity: number }) => number;
	};
	equippedItemBoosts?: {
		gearSetup: GearSetupType;
		items: { boostPercent: number; itemID: number }[];
		required?: boolean;
	}[];
	requiredQuests?: QuestID[];
	deathProps?: Omit<Parameters<typeof calculateSimpleMonsterDeathChance>['0'], 'currentKC'>;
	diaryRequirement?: [DiaryID, DiaryTierName];
	wildySlayerCave?: boolean;
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
	boostPercent?: number;
	optional?: boolean;
}

export interface AddXpParams {
	skillName: SkillsEnum;
	amount: number;
	duration?: number;
	multiplier?: boolean;
	minimal?: boolean;
	artificial?: boolean;
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
export type Flags = Record<string, string | number>;
export type FlagMap = Map<string, string | number>;
export type ClueBank = Record<ClueTier['name'], number>;

const diaryTiers = ['easy', 'medium', 'hard', 'elite'] as const;
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
