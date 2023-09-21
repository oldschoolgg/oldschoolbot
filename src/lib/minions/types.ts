import { Image } from '@napi-rs/canvas';
import { XpGainSource } from '@prisma/client';
import { Bank, MonsterKillOptions } from 'oldschooljs';
import SimpleMonster from 'oldschooljs/dist/structures/SimpleMonster';

import { QuestID } from '../../mahoji/lib/abstracted_commands/questCommand';
import { ClueTier } from '../clues/clueTiers';
import { BitField, PerkTier } from '../constants';
import { Diary, DiaryTier } from '../diaries';
import { GearSetupType, GearStat, OffenceGearStat } from '../gear/types';
import { POHBoosts } from '../poh';
import { LevelRequirements, SkillsEnum } from '../skilling/types';
import { ArrayItemsResolved, ItemBank, Skills } from '../types';
import { MonsterActivityTaskOptions } from '../types/minions';
import { calculateSimpleMonsterDeathChance } from '../util';
import { AttackStyles } from './functions';

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
	alternateImages?: { id: number }[];
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
	specialLoot?: (loot: Bank, user: MUser, data: MonsterActivityTaskOptions) => Promise<void>;
	effect?: (opts: {
		messages: string[];
		user: MUser;
		quantity: number;
		monster: KillableMonster;
		loot: Bank;
		data: MonsterActivityTaskOptions;
	}) => Promise<unknown>;
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
	}[];
	requiredQuests?: QuestID[];
	deathProps?: Omit<Parameters<typeof calculateSimpleMonsterDeathChance>['0'], 'currentKC'>;
	diaryRequirement?: [Diary, DiaryTier];
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

export interface ResolveAttackStylesParams {
	monsterID: number | undefined;
	boostMethod?: string;
}

export interface BlowpipeData {
	scales: number;
	dartQuantity: number;
	dartID: number | null;
}
export type Flags = Record<string, string | number>;
export type FlagMap = Map<string, string | number>;
export type ClueBank = Record<ClueTier['name'], number>;
