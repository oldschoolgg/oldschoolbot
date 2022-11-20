import { Bank } from 'oldschooljs';

import { BarbarianMixable } from '../../../types';

const LeapingFish: BarbarianMixable[] = [
	{
		name: 'Cut leaping sturgeon',
		aliases: ['leaping sturgeon', 'cut leaping sturgeon', 'sturgeon'],
		xp: 15,
		inputItems: new Bank({ 'Leaping sturgeon': 1 }),
		tickRate: 1
	},
	{
		name: 'Cut leaping trout',
		aliases: ['leaping trout', 'cut leaping trout', 'trout'],
		xp: 15,
		inputItems: new Bank({ 'Leaping trout': 1 }),
		tickRate: 1
	},
	{
		name: 'Cut leaping salmon',
		aliases: ['leaping salmon', 'cut leaping salmon', 'salmon'],
		xp: 15,
		inputItems: new Bank({ 'Leaping salmon': 1 }),
		tickRate: 1
	}
];

export default LeapingFish;
