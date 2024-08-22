import { Time } from 'e';

import itemID from '../../../../util/itemID';
import type { SmithedItem } from '../../../types';

const Rune: SmithedItem[] = [
	{
		name: 'Rune dagger',
		level: 85,
		xp: 75.0,
		id: itemID('Rune dagger'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Rune axe',
		level: 86,
		xp: 75.0,
		id: itemID('Rune axe'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Rune mace',
		level: 87,
		xp: 75,
		id: itemID('Rune mace'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Runite bolts (unf)',
		level: 88,
		xp: 75.0,
		id: itemID('Runite bolts (unf)'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	},
	{
		name: 'Rune med helm',
		level: 88,
		xp: 75.0,
		id: itemID('Rune med helm'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Rune sword',
		level: 89,
		xp: 75,
		id: itemID('Rune sword'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Rune nails',
		level: 89,
		xp: 75.0,
		id: itemID('Rune nails'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 15
	},
	{
		name: 'Rune dart tip',
		level: 89,
		xp: 75.0,
		id: itemID('Rune dart tip'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	},
	{
		name: 'Rune arrowtips',
		level: 90,
		xp: 75.0,
		id: itemID('Rune arrowtips'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 15
	},
	{
		name: 'Rune scimitar',
		level: 90,
		xp: 150.0,
		id: itemID('Rune scimitar'),
		inputBars: { [itemID('Runite bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Rune hasta',
		level: 90,
		xp: 75.0,
		id: itemID('Rune hasta'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Rune spear',
		level: 90,
		xp: 75.0,
		id: itemID('Rune spear'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Rune longsword',
		level: 91,
		xp: 150.0,
		id: itemID('Rune longsword'),
		inputBars: { [itemID('Runite bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Rune javelin heads',
		level: 91,
		xp: 75.0,
		id: itemID('Rune javelin heads'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 5
	},
	{
		name: 'Runite limbs',
		level: 91,
		xp: 75.0,
		id: itemID('Runite limbs'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Rune knife',
		level: 92,
		xp: 75.0,
		id: itemID('Rune knife'),
		inputBars: { [itemID('Runite bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 5
	},
	{
		name: 'Rune full helm',
		level: 92,
		xp: 150.0,
		id: itemID('Rune full helm'),
		inputBars: { [itemID('Runite bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Rune sq shield',
		level: 93,
		xp: 150.0,
		id: itemID('Rune sq shield'),
		inputBars: { [itemID('Runite bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Rune warhammer',
		level: 94,
		xp: 225.0,
		id: itemID('Rune warhammer'),
		inputBars: { [itemID('Runite bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Rune battleaxe',
		level: 95,
		xp: 225.0,
		id: itemID('Rune battleaxe'),
		inputBars: { [itemID('Runite bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Rune chainbody',
		level: 96,
		xp: 225.0,
		id: itemID('Rune chainbody'),
		inputBars: { [itemID('Runite bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Rune kiteshield',
		level: 97,
		xp: 225.0,
		id: itemID('Rune kiteshield'),
		inputBars: { [itemID('Runite bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Rune claws',
		level: 98,
		xp: 150.0,
		id: itemID('Rune claws'),
		inputBars: { [itemID('Runite bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Rune platebody',
		level: 99,
		xp: 375.0,
		id: itemID('Rune platebody'),
		inputBars: { [itemID('Runite bar')]: 5 },
		timeToUse: Time.Second * 4.8,
		outputMultiple: 1
	},
	{
		name: 'Rune plateskirt',
		level: 99,
		xp: 225.0,
		id: itemID('Rune plateskirt'),
		inputBars: { [itemID('Runite bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Rune platelegs',
		level: 99,
		xp: 225.0,
		id: itemID('Rune platelegs'),
		inputBars: { [itemID('Runite bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Rune 2h sword',
		level: 99,
		xp: 225.0,
		id: itemID('Rune 2h sword'),
		inputBars: { [itemID('Runite bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	}
];

export default Rune;
