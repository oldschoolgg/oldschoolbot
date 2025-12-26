import { Bank, itemID } from 'oldschooljs';

import type { Cookable } from '@/lib/skilling/types.js';

export const bsoCookables: Cookable[] = [
	{
		level: 120,
		xp: 243.2,
		id: itemID('Rocktail'),
		name: 'Rocktail',
		inputCookables: { [itemID('Raw rocktail')]: 1 },
		stopBurnAt: 120,
		stopBurnAtCG: 37,
		burntCookable: 367
	},
	{
		level: 30,
		xp: 100,
		id: itemID('Turkey'),
		name: 'Turkey',
		inputCookables: { [itemID('Raw turkey')]: 1 },
		stopBurnAt: 70,
		stopBurnAtCG: 37,
		burntCookable: itemID('Burnt turkey')
	},
	{
		level: 80,
		xp: 1000,
		id: itemID('Christmas cake'),
		name: 'Christmas cake',
		inputCookables: new Bank()
			.add('Gingerbread')
			.add('Grimy salt')
			.add('Snail oil')
			.add('Ashy flour')
			.add('Banana-butter')
			.add('Fresh rat milk')
			.add('Pristine chocolate bar')
			.add('Smokey egg')
			.toJSON(),
		stopBurnAt: 150,
		stopBurnAtCG: 150,
		burntCookable: itemID('Burnt christmas cake')
	}
];
