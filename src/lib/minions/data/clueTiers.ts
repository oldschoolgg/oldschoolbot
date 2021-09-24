import { Time } from 'e';
import { Clues } from 'oldschooljs';

import { GrandmasterClueTable } from '../../simulation/grandmasterClue';
import itemID from '../../util/itemID';
import { ClueTier } from '../types';

const { Beginner, Easy, Medium, Hard, Elite, Master } = Clues;

const ClueTiers: ClueTier[] = [
	{
		name: 'Beginner',
		aliases: ['beginner', 'beg', 'b'],
		table: Beginner,
		id: 23_245,
		scrollID: 23_182,
		timeToFinish: Time.Minute * 4.5,
		mimicChance: false
	},
	{
		name: 'Easy',
		aliases: ['easy', 'ez'],
		table: Easy,
		id: 20_546,
		scrollID: 2677,
		timeToFinish: Time.Minute * 6.5,
		milestoneReward: {
			itemReward: itemID('Large spade'),
			scoreNeeded: 500
		},
		mimicChance: false
	},
	{
		name: 'Medium',
		aliases: ['medium', 'med'],
		table: Medium,
		id: 20_545,
		scrollID: 2801,
		timeToFinish: Time.Minute * 9,
		milestoneReward: {
			itemReward: itemID('Clueless scroll'),
			scoreNeeded: 400
		},
		mimicChance: false
	},
	{
		name: 'Hard',
		aliases: ['hard', 'hrd', 'h'],
		table: Hard,
		id: 20_544,
		scrollID: 2722,
		timeToFinish: Time.Minute * 12.5,
		mimicChance: false
	},
	{
		name: 'Elite',
		aliases: ['elite', 'e'],
		table: Elite,
		id: 20_543,
		scrollID: 12_073,
		timeToFinish: Time.Minute * 15.7,
		milestoneReward: {
			itemReward: itemID('Heavy casket'),
			scoreNeeded: 200
		},
		mimicChance: 35
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
		mimicChance: 15
	},
	{
		name: 'Grandmaster',
		aliases: ['grandmaster', 'gm', 'gmc'],
		table: GrandmasterClueTable,
		id: 19_838,
		scrollID: 19_837,
		timeToFinish: Time.Minute * 29.3,
		mimicChance: false
	}
];

export default ClueTiers;
