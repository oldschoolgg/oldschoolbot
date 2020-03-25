import { Clues } from 'oldschooljs';

const { Beginner, Easy, Medium, Hard, Elite, Master } = Clues;

import { Time } from './constants';
import { ClueTier } from './types';

const clueTiers: ClueTier[] = [
	{
		name: 'Beginner',
		table: Beginner,
		id: 23245,
		scrollID: 23182,
		timeToFinish: Time.Minute * 4.5
	},
	{
		name: 'Easy',
		table: Easy,
		id: 20546,
		scrollID: 2677,
		timeToFinish: Time.Minute * 6.5
	},
	{
		name: 'Medium',
		table: Medium,
		id: 20545,
		scrollID: 2801,
		timeToFinish: Time.Minute * 9
	},
	{
		name: 'Hard',
		table: Hard,
		id: 20544,
		scrollID: 2722,
		timeToFinish: Time.Minute * 12.5
	},
	{
		name: 'Elite',
		table: Elite,
		id: 20543,
		scrollID: 12073,
		timeToFinish: Time.Minute * 15.7
	},
	{
		name: 'Master',
		table: Master,
		id: 19836,
		scrollID: 19835,
		timeToFinish: Time.Minute * 19.3
	}
];

export default clueTiers;
