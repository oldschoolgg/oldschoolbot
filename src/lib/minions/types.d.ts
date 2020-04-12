import { Image } from 'canvas';
import { BeginnerCasket } from 'oldschooljs/dist/simulation/clues/Beginner';
import { MediumCasket } from 'oldschooljs/dist/simulation/clues/Medium';
import { EasyCasket } from 'oldschooljs/dist/simulation/clues/Easy';
import { HardCasket } from 'oldschooljs/dist/simulation/clues/Hard';
import { EliteCasket } from 'oldschooljs/dist/simulation/clues/Elite';
import { MasterCasket } from 'oldschooljs/dist/simulation/clues/Master';

import { Bank } from '../types';
import { PerkTier } from '../constants';

export interface BankBackground {
	image: Image | null;
	id: number;
	name: string;
	available: boolean;
	collectionLogItemsNeeded?: Bank;
	perkTierNeeded?: PerkTier;
	gpCost?: number;
	itemCost?: Bank;
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
}
