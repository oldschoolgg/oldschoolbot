import { Time } from 'e';

import itemID from '../../../../util/itemID';
import { SmithedItem } from '../../../types';

const Dwarven: SmithedItem[] = [
	{
		name: 'Dwarven greataxe',
		level: 99,
		xp: 12.5,
		id: itemID('Dwarven greataxe'),
		inputBars: { [itemID('Dwarven bar')]: 3 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Dwarven knife',
		level: 99,
		xp: 12.5,
		id: itemID('Dwarven knife'),
		inputBars: { [itemID('Dwarven bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Dwarven gauntlets',
		level: 99,
		xp: 12.5,
		id: itemID('Dwarven gauntlets'),
		inputBars: { [itemID('Dwarven bar')]: 2 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Dwarven greathammer',
		level: 99,
		xp: 12.5,
		id: itemID('Dwarven greathammer'),
		inputBars: { [itemID('Dwarven bar')]: 3 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Dwarven pickaxe',
		level: 99,
		xp: 12.5,
		id: itemID('Dwarven pickaxe'),
		inputBars: { [itemID('Dwarven bar')]: 2 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	}
];

export default Dwarven;
