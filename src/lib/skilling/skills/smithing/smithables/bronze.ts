import { Time } from 'e';

import itemID from '../../../../util/itemID';
import type { SmithedItem } from '../../../types';

const Bronze: SmithedItem[] = [
	{
		name: 'Bronze axe',
		level: 1,
		xp: 12.5,
		id: itemID('Bronze axe'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Bronze dagger',
		level: 1,
		xp: 12.5,
		id: itemID('Bronze dagger'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Bronze mace',
		level: 2,
		xp: 12.5,
		id: itemID('Bronze mace'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Bronze med helm',
		level: 3,
		xp: 12.5,
		id: itemID('Bronze med helm'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Bronze bolts (unf)',
		level: 3,
		xp: 12.5,
		id: itemID('Bronze bolts (unf)'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	},
	{
		name: 'Bronze nails',
		level: 4,
		xp: 12.5,
		id: itemID('Bronze nails'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 15
	},
	{
		name: 'Bronze sword',
		level: 4,
		xp: 12.5,
		id: itemID('Bronze sword'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Bronze wire',
		level: 4,
		xp: 12.5,
		id: itemID('Bronze wire'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Bronze dart tip',
		level: 4,
		xp: 12.5,
		id: itemID('Bronze dart tip'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	},
	{
		name: 'Bronze scimitar',
		level: 5,
		xp: 25,
		id: itemID('Bronze scimitar'),
		inputBars: { [itemID('Bronze bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Bronze hasta',
		level: 5,
		xp: 12.5,
		id: itemID('Bronze hasta'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Bronze arrowtips',
		level: 5,
		xp: 12.5,
		id: itemID('Bronze arrowtips'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 15
	},
	{
		name: 'Bronze spear',
		level: 5,
		xp: 12.5,
		id: itemID('Bronze spear'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Bronze javelin heads',
		level: 6,
		xp: 12.5,
		id: itemID('Bronze javelin heads'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 5
	},
	{
		name: 'Bronze longsword',
		level: 6,
		xp: 25,
		id: itemID('Bronze longsword'),
		inputBars: { [itemID('Bronze bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Bronze limbs',
		level: 6,
		xp: 12.5,
		id: itemID('Bronze limbs'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Bronze knife',
		level: 7,
		xp: 12.5,
		id: itemID('Bronze knife'),
		inputBars: { [itemID('Bronze bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 5
	},
	{
		name: 'Bronze full helm',
		level: 7,
		xp: 25,
		id: itemID('Bronze full helm'),
		inputBars: { [itemID('Bronze bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Bronze sq shield',
		level: 8,
		xp: 25.0,
		id: itemID('Bronze sq shield'),
		inputBars: { [itemID('Bronze bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Bronze warhammer',
		level: 9,
		xp: 37.5,
		id: itemID('Bronze warhammer'),
		inputBars: { [itemID('Bronze bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Bronze battleaxe',
		level: 10,
		xp: 37.5,
		id: itemID('Bronze battleaxe'),
		inputBars: { [itemID('Bronze bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Bronze chainbody',
		level: 11,
		xp: 37.5,
		id: itemID('Bronze chainbody'),
		inputBars: { [itemID('Bronze bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Bronze kiteshield',
		level: 12,
		xp: 37.5,
		id: itemID('Bronze kiteshield'),
		inputBars: { [itemID('Bronze bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Bronze claws',
		level: 13,
		xp: 25,
		id: itemID('Bronze claws'),
		inputBars: { [itemID('Bronze bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Bronze 2h sword',
		level: 14,
		xp: 37.5,
		id: itemID('Bronze 2h sword'),
		inputBars: { [itemID('Bronze bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Bronze platelegs',
		level: 16,
		xp: 37.5,
		id: itemID('Bronze platelegs'),
		inputBars: { [itemID('Bronze bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Bronze plateskirt',
		level: 16,
		xp: 37.5,
		id: itemID('Bronze plateskirt'),
		inputBars: { [itemID('Bronze bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Bronze platebody',
		level: 18,
		xp: 62.5,
		id: itemID('Bronze platebody'),
		inputBars: { [itemID('Bronze bar')]: 5 },
		timeToUse: Time.Second * 4.8,
		outputMultiple: 1
	}
];

export default Bronze;
