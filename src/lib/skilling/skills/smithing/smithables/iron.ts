import { Time } from 'e';

import itemID from '../../../../util/itemID';
import type { SmithedItem } from '../../../types';

const Iron: SmithedItem[] = [
	{
		name: 'Iron dagger',
		level: 15,
		xp: 25,
		id: itemID('Iron dagger'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Iron axe',
		level: 16,
		xp: 25,
		id: itemID('Iron axe'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Iron spit',
		level: 17,
		xp: 25,
		id: itemID('Iron spit'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Iron mace',
		level: 17,
		xp: 25.0,
		id: itemID('Iron mace'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Iron bolts (unf)',
		level: 18,
		xp: 25.0,
		id: itemID('Iron bolts (unf)'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	},
	{
		name: 'Iron med helm',
		level: 18,
		xp: 25,
		id: itemID('Iron med helm'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Iron nails',
		level: 19,
		xp: 25.0,
		id: itemID('Iron nails'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 15
	},
	{
		name: 'Iron dart tip',
		level: 19,
		xp: 25.0,
		id: itemID('Iron dart tip'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 10
	},
	{
		name: 'Iron sword',
		level: 19,
		xp: 25.0,
		id: itemID('Iron sword'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Iron arrowtips',
		level: 20,
		xp: 25,
		id: itemID('Iron arrowtips'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 15
	},
	{
		name: 'Iron scimitar',
		level: 20,
		xp: 25.0,
		id: itemID('Iron scimitar'),
		inputBars: { [itemID('Iron bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Iron hasta',
		level: 20,
		xp: 25.0,
		id: itemID('Iron hasta'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Iron spear',
		level: 20,
		xp: 25.0,
		id: itemID('Iron spear'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Iron longsword',
		level: 21,
		xp: 50.0,
		id: itemID('Iron longsword'),
		inputBars: { [itemID('Iron bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Iron javelin heads',
		level: 21,
		xp: 25.0,
		id: itemID('Iron javelin heads'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 5
	},
	{
		name: 'Iron full helm',
		level: 22,
		xp: 50.0,
		id: itemID('Iron full helm'),
		inputBars: { [itemID('Iron bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Iron knife',
		level: 22,
		xp: 25.0,
		id: itemID('Iron knife'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 5
	},
	{
		name: 'Iron limbs',
		level: 23,
		xp: 25.0,
		id: itemID('Iron limbs'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Iron sq shield',
		level: 23,
		xp: 50.0,
		id: itemID('Iron sq shield'),
		inputBars: { [itemID('Iron bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Iron warhammer',
		level: 24,
		xp: 75.0,
		id: itemID('Iron warhammer'),
		inputBars: { [itemID('Iron bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Iron battleaxe',
		level: 25,
		xp: 75.0,
		id: itemID('Iron battleaxe'),
		inputBars: { [itemID('Iron bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Oil lantern frame',
		level: 26,
		xp: 25.0,
		id: itemID('Oil lantern frame'),
		inputBars: { [itemID('Iron bar')]: 1 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1
	},
	{
		name: 'Iron chainbody',
		level: 26,
		xp: 75.0,
		id: itemID('Iron chainbody'),
		inputBars: { [itemID('Iron bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Iron kiteshield',
		level: 27,
		xp: 75.0,
		id: itemID('Iron kiteshield'),
		inputBars: { [itemID('Iron bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Iron claws',
		level: 28,
		xp: 50.0,
		id: itemID('Iron claws'),
		inputBars: { [itemID('Iron bar')]: 2 },
		timeToUse: Time.Second * 3.7,
		outputMultiple: 1
	},
	{
		name: 'Iron 2h sword',
		level: 29,
		xp: 75.0,
		id: itemID('Iron 2h sword'),
		inputBars: { [itemID('Iron bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Iron plateskirt',
		level: 31,
		xp: 75,
		id: itemID('Iron plateskirt'),
		inputBars: { [itemID('Iron bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Iron platelegs',
		level: 31,
		xp: 75.0,
		id: itemID('Iron platelegs'),
		inputBars: { [itemID('Iron bar')]: 3 },
		timeToUse: Time.Second * 4,
		outputMultiple: 1
	},
	{
		name: 'Iron platebody',
		level: 33,
		xp: 125,
		id: itemID('Iron platebody'),
		inputBars: { [itemID('Iron bar')]: 5 },
		timeToUse: Time.Second * 4.8,
		outputMultiple: 1
	}
];

export default Iron;
