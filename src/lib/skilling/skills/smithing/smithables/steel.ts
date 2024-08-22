import { Time } from 'e';

import itemID from '../../../../util/itemID';
import type { SmithedItem } from '../../../types';

const Steel: SmithedItem[] = [
	{
		name: 'Steel dagger',
		level: 30,
		xp: 37.5,
		id: itemID('Steel dagger'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Steel axe',
		level: 31,
		xp: 37.5,
		id: itemID('Steel axe'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Steel mace',
		level: 32,
		xp: 37.5,
		id: itemID('Steel mace'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Steel med helm',
		level: 33,
		xp: 37.5,
		id: itemID('Steel med helm'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Steel bolts (unf)',
		level: 33,
		xp: 37.5,
		id: itemID('Steel bolts (unf)'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	},
	{
		name: 'Steel dart tip',
		level: 34,
		xp: 37.5,
		id: itemID('Steel dart tip'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	},
	{
		name: 'Steel nails',
		level: 34,
		xp: 37.5,
		id: itemID('Steel nails'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 15
	},
	{
		name: 'Steel sword',
		level: 34,
		xp: 37.5,
		id: itemID('Steel sword'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Cannonball',
		level: 35,
		xp: 37.5,
		id: itemID('Cannonball'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 6,
		outputMultiple: 4
	},
	{
		name: 'Steel scimitar',
		level: 35,
		xp: 75,
		id: itemID('Steel scimitar'),
		inputBars: { [itemID('Steel bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Steel arrowtips',
		level: 35,
		xp: 37.5,
		id: itemID('Steel arrowtips'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 15
	},
	{
		name: 'Steel hasta',
		level: 35,
		xp: 37.5,
		id: itemID('Steel hasta'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Steel spear',
		level: 35,
		xp: 37.5,
		id: itemID('Steel spear'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Steel limbs',
		level: 36,
		xp: 37.5,
		id: itemID('Steel limbs'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Steel studs',
		level: 36,
		xp: 37.5,
		id: itemID('Steel studs'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Steel longsword',
		level: 36,
		xp: 75,
		id: itemID('Steel longsword'),
		inputBars: { [itemID('Steel bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Steel javelin heads',
		level: 36,
		xp: 37.5,
		id: itemID('Steel javelin heads'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 5
	},
	{
		name: 'Steel knife',
		level: 37,
		xp: 37.5,
		id: itemID('Steel knife'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3,
		outputMultiple: 5
	},
	{
		name: 'Steel full helm',
		level: 37,
		xp: 75,
		id: itemID('Steel full helm'),
		inputBars: { [itemID('Steel bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Steel sq shield',
		level: 38,
		xp: 75.0,
		id: itemID('Steel sq shield'),
		inputBars: { [itemID('Steel bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Steel warhammer',
		level: 39,
		xp: 112.5,
		id: itemID('Steel warhammer'),
		inputBars: { [itemID('Steel bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Steel battleaxe',
		level: 40,
		xp: 112.5,
		id: itemID('Steel battleaxe'),
		inputBars: { [itemID('Steel bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Steel chainbody',
		level: 41,
		xp: 112.5,
		id: itemID('Steel chainbody'),
		inputBars: { [itemID('Steel bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Steel kiteshield',
		level: 42,
		xp: 112.5,
		id: itemID('Steel kiteshield'),
		inputBars: { [itemID('Steel bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Steel claws',
		level: 43,
		xp: 75,
		id: itemID('Steel claws'),
		inputBars: { [itemID('Steel bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Steel 2h sword',
		level: 44,
		xp: 112.5,
		id: itemID('Steel 2h sword'),
		inputBars: { [itemID('Steel bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Steel platelegs',
		level: 46,
		xp: 112.5,
		id: itemID('Steel platelegs'),
		inputBars: { [itemID('Steel bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Steel plateskirt',
		level: 46,
		xp: 112.5,
		id: itemID('Steel plateskirt'),
		inputBars: { [itemID('Steel bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Steel platebody',
		level: 48,
		xp: 187.5,
		id: itemID('Steel platebody'),
		inputBars: { [itemID('Steel bar')]: 5 },
		timeToUse: Time.Second * 4.8,
		outputMultiple: 1
	},
	{
		name: 'Bullseye lantern (unf)',
		level: 49,
		xp: 37.5,
		id: itemID('Bullseye lantern (unf)'),
		inputBars: { [itemID('Steel bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	}
];

export default Steel;
