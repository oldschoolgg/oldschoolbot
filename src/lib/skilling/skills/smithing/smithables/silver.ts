import { Time } from 'e';

import itemID from '../../../../util/itemID';
import { SmithedItem } from '../../../types';

const Silver: SmithedItem[] = [
	{
		name: 'Silver stake',
		level: 95,
		xp: 77,
		id: itemID('Silver stake'),
		inputBars: { [itemID('Silver bar')]: 3, [itemID('Elder logs')]: 1 },
		timeToUse: Time.Second * 3,
		outputMultiple: 1,
		cantBeDoubled: true
	},
	{
		name: 'Silver bolts (unf)',
		level: 21,
		xp: 50.0,
		id: itemID('Silver bolts (unf)'),
		inputBars: { [itemID('Silver bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	}
];

export default Silver;
