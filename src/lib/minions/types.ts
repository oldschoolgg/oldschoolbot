import type { GearSetupType, XpGainSource } from '@prisma/client';
import type { ArrayItemsResolved, Bank, Item, ItemBank, MonsterKillOptions, SimpleMonster } from 'oldschooljs';
import type { OffenceGearStat } from 'oldschooljs/gear';

import type { ClueTier } from '@/lib/clues/clueTiers.js';
import type { BitField } from '@/lib/constants';
import type { BSOMonsters } from '@/lib/minions/data/killableMonsters/custom/customMonsters.js';
import type { QuestID } from '@/lib/minions/data/quests.js';
import type { AttackStyles } from '@/lib/minions/functions/index.js';
import type { POHBoosts } from '@/lib/poh/index.js';
import type { MinigameName } from '@/lib/settings/minigames.js';
import type { LevelRequirements, SkillNameType, SkillsEnum } from '@/lib/skilling/types.js';
import type { XPBank } from '@/lib/structures/Bank';
import type { GearRequirement, GearRequirements } from '@/lib/structures/Gear';
import type { GearBank } from '@/lib/structures/GearBank';
import type { MUserStats } from '@/lib/structures/MUserStats';
import type { UpdateBank } from '@/lib/structures/UpdateBank';
import type { Skills } from '@/lib/types/index.js';
import type { calculateSimpleMonsterDeathChance } from '@/lib/util/smallUtils.js';

export type KillableMonsterEffect = (opts: {
	gearBank: GearBank;
	quantity: number;
	monster: KillableMonster;
	loot: Bank;
	updateBank: UpdateBank;
}) => void | { xpBank?: XPBank; loot?: Bank; messages: string[] };

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
	specialLoot?: (data: { loot: Bank; ownedItems: Bank; quantity: number; cl: Bank; user?: MUser }) => void;
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
		required?: boolean;
	}[];
	requiredQuests?: QuestID[];
	deathProps?: Omit<Parameters<typeof calculateSimpleMonsterDeathChance>['0'], 'currentKC'>;
	diaryRequirement?: [DiaryID, DiaryTierName];
	wildySlayerCave?: boolean;
	requiredBitfield?: BitField;

	minimumWeaponShieldStats?: Partial<Record<GearSetupType, Required<GearRequirement>>>;
	tameCantKill?: true;
	customRequirement?: (user: MUser) => Promise<string | null>;
	setupsUsed?: GearSetupType[];
	kcRequirements?: Partial<Record<keyof typeof BSOMonsters, number>>;
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
	skillName: SkillsEnum | SkillNameType;
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
