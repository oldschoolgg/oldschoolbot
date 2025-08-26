import { Items } from 'oldschooljs';

import type { CutLeapingFish } from '../../types';

const LeapingFish: CutLeapingFish[] = [
	{
		item: Items.getOrThrow('Leaping sturgeon'),
		aliases: ['leaping sturgeon', 'cut leaping sturgeon', 'sturgeon'],
		tickRate: 1
	},
	{
		item: Items.getOrThrow('Leaping trout'),
		aliases: ['leaping trout', 'cut leaping trout'],
		tickRate: 1
	},
	{
		item: Items.getOrThrow('Leaping salmon'),
		aliases: ['leaping salmon', 'cut leaping salmon'],
		tickRate: 1
	}
];

export default LeapingFish;
