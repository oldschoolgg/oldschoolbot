import { Time } from 'e';
import { Clues } from 'oldschooljs';
import { BeginnerCasket, BeginnerClueTable } from 'oldschooljs/dist/simulation/clues/Beginner';
import { EasyCasket, EasyClueTable } from 'oldschooljs/dist/simulation/clues/Easy';
import { EliteCasket, EliteClueTable } from 'oldschooljs/dist/simulation/clues/Elite';
import { HardCasket, HardClueTable } from 'oldschooljs/dist/simulation/clues/Hard';
import { MasterCasket, MasterClueTable } from 'oldschooljs/dist/simulation/clues/Master';
import { MediumCasket, MediumClueTable } from 'oldschooljs/dist/simulation/clues/Medium';

import itemID from '../util/itemID';
import resolveItems from '../util/resolveItems';
import { beginnerReqs, ClueReqs } from './clueReqs';
import {
	beginnerStashes,
	easyStashes,
	eliteStashes,
	hardStashes,
	masterStashes,
	mediumStashes,
	StashUnitTier
} from './stashUnits';

const { Beginner, Easy, Medium, Hard, Elite, Master } = Clues;

interface ClueMilestoneReward {
	itemReward: number;
	scoreNeeded: number;
}

export interface ClueTier {
	name: 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Elite' | 'Master';
	table: BeginnerCasket | EasyCasket | MediumCasket | HardCasket | EliteCasket | MasterCasket;
	id: number;
	scrollID: number;
	timeToFinish: number;
	milestoneReward?: ClueMilestoneReward;
	mimicChance: number | false;
	allItems: number[];
	stashUnits: StashUnitTier;
	reqs: ClueReqs;
	implings?: number[];
}

export const ClueTiers: ClueTier[] = [
	{
		name: 'Beginner',
		table: Beginner,
		id: 23_245,
		scrollID: 23_182,
		timeToFinish: Time.Minute * 2.5,
		mimicChance: false,
		allItems: BeginnerClueTable.allItems,
		stashUnits: beginnerStashes,
		reqs: beginnerReqs,
		implings: resolveItems(['Baby impling jar', 'Young impling jar'])
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
		allItems: EasyClueTable.allItems,
		stashUnits: easyStashes,
		reqs: beginnerReqs,
		implings: resolveItems(['Baby impling jar', 'Young impling jar', 'Gourmet impling jar'])
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
		allItems: MediumClueTable.allItems,
		stashUnits: mediumStashes,
		reqs: beginnerReqs,
		implings: resolveItems(['Earth impling jar', 'Essence impling jar', 'Eclectic impling jar'])
	},
	{
		name: 'Hard',
		table: Hard,
		id: 20_544,
		scrollID: 2722,
		timeToFinish: Time.Minute * 12.5,
		mimicChance: false,
		allItems: HardClueTable.allItems,
		stashUnits: hardStashes,
		reqs: beginnerReqs,
		implings: resolveItems(['Nature impling jar', 'Magpie impling jar', 'Ninja impling jar'])
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
		allItems: EliteClueTable.allItems,
		stashUnits: eliteStashes,
		reqs: beginnerReqs,
		implings: resolveItems(['Crystal impling jar', 'Dragon impling jar'])
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
		allItems: MasterClueTable.allItems,
		stashUnits: masterStashes,
		reqs: beginnerReqs
	}
];
