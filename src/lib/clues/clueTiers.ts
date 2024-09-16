import { Time } from 'e';
import { Clues } from 'oldschooljs';
import type { BeginnerCasket } from 'oldschooljs/dist/simulation/clues/Beginner';
import { BeginnerClueTable } from 'oldschooljs/dist/simulation/clues/Beginner';
import type { EasyCasket } from 'oldschooljs/dist/simulation/clues/Easy';
import { EasyClueTable } from 'oldschooljs/dist/simulation/clues/Easy';
import type { EliteCasket } from 'oldschooljs/dist/simulation/clues/Elite';
import { EliteClueTable } from 'oldschooljs/dist/simulation/clues/Elite';
import type { HardCasket } from 'oldschooljs/dist/simulation/clues/Hard';
import { HardClueTable } from 'oldschooljs/dist/simulation/clues/Hard';
import type { MasterCasket } from 'oldschooljs/dist/simulation/clues/Master';
import { MasterClueTable } from 'oldschooljs/dist/simulation/clues/Master';
import type { MediumCasket } from 'oldschooljs/dist/simulation/clues/Medium';
import { MediumClueTable } from 'oldschooljs/dist/simulation/clues/Medium';

import {
	cluesBeginnerCL,
	cluesEasyCL,
	cluesElderCL,
	cluesEliteCL,
	cluesGrandmasterCL,
	cluesHardCL,
	cluesMasterCL,
	cluesMediumCL
} from '../data/CollectionsExport';
import { type ElderClue, ElderClueTable } from '../simulation/elderClue';
import { GrandmasterClueTable } from '../simulation/grandmasterClue';
import itemID from '../util/itemID';
import resolveItems from '../util/resolveItems';
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
	name: 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Elite' | 'Master' | 'Grandmaster' | 'Elder';
	table: BeginnerCasket | EasyCasket | MediumCasket | HardCasket | EliteCasket | MasterCasket | ElderClue;
	id: number;
	scrollID: number;
	timeToFinish: number;
	milestoneReward?: ClueMilestoneReward;
	mimicChance: number | false;
	allItems: number[];
	aliases: string[];
	stashUnits: StashUnitTier;
	reqs: ClueReqs;
	implings?: number[];
	qtyForGrandmasters: number;
	trickableItems?: number[];
	cl: number[];
}

export const ClueTiers: ClueTier[] = [
	{
		name: 'Beginner',
		aliases: ['beginner', 'beg', 'b'],
		table: Beginner,
		id: 23_245,
		scrollID: 23_182,
		timeToFinish: Time.Minute * 2.5,
		mimicChance: false,
		allItems: BeginnerClueTable.allItems,
		stashUnits: beginnerStashes,
		reqs: beginnerReqs,
		implings: resolveItems(['Baby impling jar', 'Young impling jar']),
		qtyForGrandmasters: 0,
		cl: cluesBeginnerCL
	},
	{
		name: 'Easy',
		aliases: ['easy', 'ez'],
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
		implings: resolveItems(['Baby impling jar', 'Young impling jar', 'Gourmet impling jar']),
		qtyForGrandmasters: 300,
		cl: cluesEasyCL
	},
	{
		name: 'Medium',
		aliases: ['medium', 'med'],
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
		implings: resolveItems(['Earth impling jar', 'Essence impling jar', 'Eclectic impling jar']),
		qtyForGrandmasters: 250,
		cl: cluesMediumCL
	},
	{
		name: 'Hard',
		aliases: ['hard', 'hrd', 'h'],
		table: Hard,
		id: 20_544,
		scrollID: 2722,
		timeToFinish: Time.Minute * 12.5,
		mimicChance: false,
		allItems: HardClueTable.allItems,
		stashUnits: hardStashes,
		reqs: beginnerReqs,
		implings: resolveItems(['Nature impling jar', 'Magpie impling jar', 'Ninja impling jar']),
		qtyForGrandmasters: 200,
		cl: cluesHardCL
	},
	{
		name: 'Elite',
		aliases: ['elite', 'e'],
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
		implings: resolveItems(['Crystal impling jar', 'Dragon impling jar']),
		qtyForGrandmasters: 150,
		cl: cluesEliteCL
	},
	{
		name: 'Master',
		aliases: ['master', 'm'],
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
		reqs: beginnerReqs,
		qtyForGrandmasters: 100,
		cl: cluesMasterCL
	},
	{
		name: 'Grandmaster',
		aliases: ['grandmaster', 'gm', 'gmc'],
		table: GrandmasterClueTable,
		id: 19_838,
		scrollID: 19_837,
		timeToFinish: Time.Minute * 32.23,
		mimicChance: false,
		allItems: GrandmasterClueTable.allItems,
		stashUnits: masterStashes,
		reqs: beginnerReqs,
		qtyForGrandmasters: 0,
		trickableItems: resolveItems([
			'First age tiara',
			'First age amulet',
			'First age cape',
			'First age bracelet',
			'First age ring'
		]),
		cl: cluesGrandmasterCL
	},
	{
		name: 'Elder',
		aliases: ['elder', 'emc'],
		table: ElderClueTable,
		id: 73_124,
		scrollID: 73_123,
		timeToFinish: Time.Minute * 42.23,
		mimicChance: false,
		allItems: resolveItems([...ElderClueTable.allItems, 'Clue bag', 'Inventors tools', 'Elder knowledge', 'Octo']),
		stashUnits: masterStashes,
		reqs: beginnerReqs,
		qtyForGrandmasters: 0,
		cl: cluesElderCL
	}
];
