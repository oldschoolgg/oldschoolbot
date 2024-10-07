import { Bank } from 'oldschooljs';

import getOSItem from '../../../../util/getOSItem';
import type { Mixable } from '../../../types';

export const bsoMixables: Mixable[] = [
	{
		item: getOSItem('Neem oil'),
		aliases: ['neem oil'],
		level: 82,
		xp: 1.5,
		inputItems: new Bank({
			'Jug of water': 1,
			'Neem drupe': 1
		}),
		tickRate: 2,
		bankTimePerPotion: 0.3
	},
	{
		item: getOSItem('Deathly toxic potion'),
		aliases: ['deathly toxic potion'],
		level: 95,
		xp: 12_000.5,
		inputItems: new Bank()
			.add('Fangs of venenatis')
			.add('Magic fang')
			.add('Cave nightshade', 100)
			.add('Poison ivy berries', 100),
		tickRate: 2,
		bankTimePerPotion: 0.3,
		defaultQuantity: 1
	}
];
