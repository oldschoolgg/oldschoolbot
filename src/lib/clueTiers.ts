import { Clues } from 'oldschooljs';
const { Beginner, Easy, Medium, Hard, Elite, Master } = Clues;

import { ClueTier } from './types';

const tiers: ClueTier[] = [
	{
		name: 'Beginner',
		table: Beginner,
		id: 23245
	},
	{
		name: 'Easy',
		table: Easy,
		id: 20546
	},
	{
		name: 'Medium',
		table: Medium,
		id: 20545
	},
	{
		name: 'Hard',
		table: Hard,
		id: 20544
	},
	{
		name: 'Elite',
		table: Elite,
		id: 20543
	},
	{
		name: 'Master',
		table: Master,
		id: 19836
	}
];

export default tiers;
