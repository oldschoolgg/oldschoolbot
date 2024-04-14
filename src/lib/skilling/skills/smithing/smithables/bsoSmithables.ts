import { Time } from 'e';

import itemID from '../../../../util/itemID';
import { SmithedItem } from '../../../types';

const BSOSmithables: SmithedItem[] = [
	{
		name: 'Sun-god axe head',
		level: 110,
		xp: 5123,
		id: itemID('Sun-god axe head'),
		inputBars: { [itemID('Sun-metal bar')]: 2 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1,
		qpRequired: 400,
		cantBeDoubled: true
	}
];

export default BSOSmithables;
