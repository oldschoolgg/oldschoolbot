import { Time } from 'e';

import itemID from '../../../../util/itemID';
import type { SmithedItem } from '../../../types';

const Gold: SmithedItem[] = [
	{
		name: 'Gold helmet',
		level: 50,
		xp: 30,
		id: itemID('Gold helmet'),
		inputBars: { [itemID('Gold bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1,
		qpRequired: 4
	},
	{
		name: 'Gold bowl',
		level: 50,
		xp: 30,
		id: itemID('Gold bowl'),
		inputBars: { [itemID('Gold bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1,
		qpRequired: 111
	}
];

export default Gold;
