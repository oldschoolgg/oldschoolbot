import { Time } from 'e';

import itemID from '../../../../util/itemID';
import { SmithedItem } from '../../../types';

const Custom: SmithedItem[] = [
	{
		name: 'Hellfire arrowtips',
		level: 110,
		xp: 50_000,
		id: itemID('Hellfire arrowtips'),
		inputBars: { [itemID('Ignecarus dragonclaw')]: 1, [itemID('Ignecarus scales')]: 50 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 50
	}
];

export default Custom;
