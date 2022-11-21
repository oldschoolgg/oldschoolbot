import { Bank } from 'oldschooljs';

import { CutLeapingFish } from '../../types';

const LeapingFish: CutLeapingFish[] = [
	{
		name: 'Cut leaping sturgeon',
		aliases: ['leaping sturgeon', 'cut leaping sturgeon', 'sturgeon'],
		inputItems: new Bank({ 'Leaping sturgeon': 1 }),
		tickRate: 1
	},
	{
		name: 'Cut leaping trout',
		aliases: ['leaping trout', 'cut leaping trout'],
		inputItems: new Bank({ 'Leaping trout': 1 }),
		tickRate: 1
	},
	{
		name: 'Cut leaping salmon',
		aliases: ['leaping salmon', 'cut leaping salmon'],
		inputItems: new Bank({ 'Leaping salmon': 1 }),
		tickRate: 1
	}
];

export default LeapingFish;
