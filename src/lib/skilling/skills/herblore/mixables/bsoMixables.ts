import { Bank } from 'oldschooljs';

import itemID from '../../../../util/itemID';
import { Mixable } from '../../../types';

export const bsoMixables: Mixable[] = [
	{
		name: 'Neem oil',
		aliases: ['neem oil'],
		id: itemID('Neem oil'),
		level: 82,
		xp: 1.5,
		inputItems: new Bank({
			'Jug of water': 1,
			'Neem drupe': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	}
];
