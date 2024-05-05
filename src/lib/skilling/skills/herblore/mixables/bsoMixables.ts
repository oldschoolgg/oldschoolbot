import { Bank } from 'oldschooljs';

import getOSItem from '../../../../util/getOSItem';
import { Mixable } from '../../../types';

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
	}
];
