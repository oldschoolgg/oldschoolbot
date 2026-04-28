import { Time } from '@oldschoolgg/toolkit';
import { itemID } from 'oldschooljs';

import type { SmithedItem } from '@/lib/skilling/types.js';

const fiveTicks = Time.Second * 3;

const Yama: SmithedItem[] = [
	{
		name: 'Infernal nugget',
		level: 83,
		xp: 11.5,
		id: itemID('Infernal nugget'),
		inputBars: {
			[itemID('Crushed infernal shale')]: 28,
			[itemID('Oathplate shards')]: 5
		},
		timeToUse: fiveTicks,
		outputMultiple: 1
	},
	{
		name: 'Infernal chunk',
		level: 83,
		xp: 750,
		id: itemID('Infernal chunk'),
		inputBars: {
			[itemID('Infernal nugget')]: 10
		},
		timeToUse: fiveTicks,
		outputMultiple: 1
	},
	{
		name: 'Infernal plate',
		level: 83,
		xp: 1250.1,
		id: itemID('Infernal plate'),
		inputBars: {
			[itemID('Infernal chunk')]: 1
		},
		timeToUse: Time.Second * 242.4,
		outputMultiple: 1
	},
	{
		name: 'Oathplate helm',
		level: 83,
		xp: 2000,
		id: itemID('Oathplate helm'),
		inputBars: {
			[itemID('Infernal plate')]: 9
		},
		timeToUse: fiveTicks,
		outputMultiple: 1
	},
	{
		name: 'Oathplate chest',
		level: 83,
		xp: 2000,
		id: itemID('Oathplate chest'),
		inputBars: {
			[itemID('Infernal plate')]: 9
		},
		timeToUse: fiveTicks,
		outputMultiple: 1
	},
	{
		name: 'Oathplate legs',
		level: 83,
		xp: 2000,
		id: itemID('Oathplate legs'),
		inputBars: {
			[itemID('Infernal plate')]: 9
		},
		timeToUse: fiveTicks,
		outputMultiple: 1
	}
];

export default Yama;
