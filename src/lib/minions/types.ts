import { Image } from 'canvas';
import { BeginnerCasket } from 'oldschooljs/dist/simulation/clues/Beginner';
import { EasyCasket } from 'oldschooljs/dist/simulation/clues/Easy';
import { EliteCasket } from 'oldschooljs/dist/simulation/clues/Elite';
import { HardCasket } from 'oldschooljs/dist/simulation/clues/Hard';
import { MasterCasket } from 'oldschooljs/dist/simulation/clues/Master';
import { MediumCasket } from 'oldschooljs/dist/simulation/clues/Medium';

import { PerkTier } from '../constants';
import { GearSetupTypes, GearStat, OffenceGearStat } from '../gear/types';
import { POHBoosts } from '../poh';
import { LevelRequirements } from '../skilling/types';
import { ArrayItemsResolved, ItemBank } from '../types';
import { MonsterActivityTaskOptions } from '../types/minions';

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
		kill(quantity: number): ItemBank;
	};
	emoji: string;
	wildy: boolean;
	canBeKilled: boolean;
	difficultyRating: number;
	itemsRequired?: ArrayItemsResolved;
	notifyDrops?: ArrayItemsResolved;
	qpRequired: number;

	/**
	 * A object of ([key: itemID]: boostPercentage) boosts that apply to
	 * this monster.
	 */
	itemInBankBoosts?: ItemBank;
	/**
	 * Whether or not this monster can be groupkilled.
	 */
	groupKillable?: true;
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
	/**
	 * Whether or not this monster can be attacked using certain combatskills.
	 */
	immuneToCombatSkills?: GearSetupTypes[];
}

export interface GroupMonsterActivityTaskOptions extends MonsterActivityTaskOptions {
	leader: string;
	users: string[];
}
