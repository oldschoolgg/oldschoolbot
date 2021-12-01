import { itemID, resolveNameBank } from '../../util';
import { Buyable } from './buyables';

const items = [
	['Castle wars cape (beginner)', 100],
	['Castle wars cape (intermediate)', 500],
	['Castle wars cape (advanced)', 1000],
	['Castle wars cape (expert)', 2500],
	['Castle wars cape (legend)', 5000]
] as const;

export const bsoBuyables: Buyable[] = [
	...items.map(i => ({
		name: i[0],
		outputItems: resolveNameBank({
			[i[0]]: 1
		}),
		itemCost: resolveNameBank({
			'Castle wars ticket': i[1]
		})
	})),
	{
		name: 'Fishbowl helmet',
		outputItems: {
			[itemID('Fishbowl helmet')]: 1
		},
		qpRequired: 85,
		gpCost: 500_000
	},
	{
		name: 'Diving apparatus',
		outputItems: {
			[itemID('Diving apparatus')]: 1
		},
		qpRequired: 85,
		gpCost: 500_000
	}
];
