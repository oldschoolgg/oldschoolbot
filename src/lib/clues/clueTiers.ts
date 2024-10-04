import { Time } from 'e';
import {
	BeginnerCasket,
	Clues,
	EasyCasket,
	EliteCasket,
	HardCasket,
	type LootTable,
	MasterCasket,
	MediumCasket
} from 'oldschooljs';

import { resolveItems } from 'oldschooljs/dist/util/util';
import {
	cluesBeginnerCL,
	cluesEasyCL,
	cluesEliteCL,
	cluesHardCL,
	cluesMasterCL,
	cluesMediumCL
} from '../data/CollectionsExport';
import itemID from '../util/itemID';
import type { ClueReqs } from './clueReqs';
import { beginnerReqs } from './clueReqs';
import type { StashUnitTier } from './stashUnits';
import { beginnerStashes, easyStashes, eliteStashes, hardStashes, masterStashes, mediumStashes } from './stashUnits';

const { Beginner, Easy, Medium, Hard, Elite, Master } = Clues;

interface ClueMilestoneReward {
	itemReward: number;
	scoreNeeded: number;
}

export interface ClueTier {
	name: 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Elite' | 'Master';
	table: LootTable;
	id: number;
	scrollID: number;
	timeToFinish: number;
	milestoneReward?: ClueMilestoneReward;
	mimicChance: number | false;
	allItems: number[];
	stashUnits: StashUnitTier;
	reqs: ClueReqs;
	implings?: number[];
	cl: number[];
}

export const ClueTiers: ClueTier[] = [
	{
		name: 'Beginner',
		table: Beginner,
		id: 23_245,
		scrollID: 23_182,
		timeToFinish: Time.Minute * 2.5,
		mimicChance: false,
		allItems: BeginnerCasket.allItems,
		stashUnits: beginnerStashes,
		reqs: beginnerReqs,
		implings: resolveItems(['Baby impling jar', 'Young impling jar']),
		cl: cluesBeginnerCL
	},
	{
		name: 'Easy',
		table: Easy,
		id: 20_546,
		scrollID: 2677,
		timeToFinish: Time.Minute * 5.5,
		milestoneReward: {
			itemReward: itemID('Large spade'),
			scoreNeeded: 500
		},
		mimicChance: false,
		allItems: EasyCasket.allItems,
		stashUnits: easyStashes,
		reqs: beginnerReqs,
		implings: resolveItems(['Baby impling jar', 'Young impling jar', 'Gourmet impling jar']),
		cl: cluesEasyCL
	},
	{
		name: 'Medium',
		table: Medium,
		id: 20_545,
		scrollID: 2801,
		timeToFinish: Time.Minute * 7,
		milestoneReward: {
			itemReward: itemID('Clueless scroll'),
			scoreNeeded: 400
		},
		mimicChance: false,
		allItems: MediumCasket.allItems,
		stashUnits: mediumStashes,
		reqs: beginnerReqs,
		implings: resolveItems(['Earth impling jar', 'Essence impling jar', 'Eclectic impling jar']),
		cl: cluesMediumCL
	},
	{
		name: 'Hard',
		table: Hard,
		id: 20_544,
		scrollID: 2722,
		timeToFinish: Time.Minute * 12.5,
		mimicChance: false,
		allItems: HardCasket.allItems,
		stashUnits: hardStashes,
		reqs: beginnerReqs,
		implings: resolveItems(['Nature impling jar', 'Magpie impling jar', 'Ninja impling jar']),
		cl: cluesHardCL
	},
	{
		name: 'Elite',
		table: Elite,
		id: 20_543,
		scrollID: 12_073,
		timeToFinish: Time.Minute * 14,
		milestoneReward: {
			itemReward: itemID('Heavy casket'),
			scoreNeeded: 200
		},
		mimicChance: 35,
		allItems: EliteCasket.allItems,
		stashUnits: eliteStashes,
		reqs: beginnerReqs,
		implings: resolveItems(['Crystal impling jar', 'Dragon impling jar']),
		cl: cluesEliteCL
	},
	{
		name: 'Master',
		table: Master,
		id: 19_836,
		scrollID: 19_835,
		timeToFinish: Time.Minute * 19.3,
		milestoneReward: {
			itemReward: itemID('Scroll sack'),
			scoreNeeded: 100
		},
		mimicChance: 15,
		allItems: MasterCasket.allItems,
		stashUnits: masterStashes,
		reqs: beginnerReqs,
		cl: cluesMasterCL
	}
];
