import { Image } from 'canvas';
import { Bank, MonsterKillOptions } from 'oldschooljs';
import { BeginnerCasket } from 'oldschooljs/dist/simulation/clues/Beginner';
import { EasyCasket } from 'oldschooljs/dist/simulation/clues/Easy';
import { EliteCasket } from 'oldschooljs/dist/simulation/clues/Elite';
import { HardCasket } from 'oldschooljs/dist/simulation/clues/Hard';
import { MasterCasket } from 'oldschooljs/dist/simulation/clues/Master';
import { MediumCasket } from 'oldschooljs/dist/simulation/clues/Medium';
import SimpleMonster from 'oldschooljs/dist/structures/SimpleMonster';

import { BitField, PerkTier } from '../constants';
import { GearSetupTypes, GearStat, OffenceGearStat } from '../gear/types';
import { POHBoosts } from '../poh';
import { LevelRequirements } from '../skilling/types';
import { ArrayItemsResolved, ItemBank, Skills } from '../types';
import { AttackStyles } from './functions';

export interface BankBackground {
	image: Image | null;
	id: number;
	name: string;
	available: boolean;
	collectionLogItemsNeeded?: ItemBank;
	perkTierNeeded?: PerkTier;
	gpCost?: number;
	itemCost?: ItemBank;
	repeatImage?: Image | null;
	bitfield?: BitField;
	sacValueRequired?: number;
	skillsNeeded?: Skills;
	transparent?: true;
}

export interface ClueMilestoneReward {
	itemReward: number;
	scoreNeeded: number;
}

export interface ClueTier {
	name: string;
	table: BeginnerCasket | EasyCasket | MediumCasket | HardCasket | EliteCasket | MasterCasket;
	id: number;
	scrollID: number;
	timeToFinish: number;
	milestoneReward?: ClueMilestoneReward;
	mimicChance: number | false;
}

export type GearRequirement = Partial<{ [key in GearStat]: number }>;
export type GearRequirements = Partial<{ [key in GearSetupTypes]: GearRequirement }>;

export interface KillableMonster {
	id: number;
	name: string;
	aliases: string[];
	timeToFinish: number;
	table: {
		kill(quantity: number, options: MonsterKillOptions): Bank;
	};
	emoji?: string;
	wildy: boolean;
	canBeKilled: boolean;
	difficultyRating: number;
	itemsRequired?: ArrayItemsResolved;
	notifyDrops?: ArrayItemsResolved;
	existsInCatacombs?: boolean;
	qpRequired: number;

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
	attackStyleToUse?: GearSetupTypes;
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
	itemCost?: Bank;
	superior?: SimpleMonster;
	slayerOnly?: boolean;
	canBarrage?: boolean;
	canCannon?: boolean;
	cannonMulti?: boolean;
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
}