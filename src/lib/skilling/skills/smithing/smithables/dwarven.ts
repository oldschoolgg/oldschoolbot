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
		outputMultiple: 1,
		requiresBlacksmith: true,
		cantBeDoubled: true
	},
	{
		name: 'Dwarven knife',
		level: 99,
		xp: 12.5,
		id: itemID('Dwarven knife'),
		inputBars: { [itemID('Dwarven bar')]: 2 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1,
		requiresBlacksmith: true,
		cantBeDoubled: true
	},
	{
		name: 'Dwarven gauntlets',
		level: 99,
		xp: 12.5,
		id: itemID('Dwarven gauntlets'),
		inputBars: { [itemID('Dwarven bar')]: 3 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1,
		requiresBlacksmith: true,
		cantBeDoubled: true
	},
	{
		name: 'Dwarven greathammer',
		level: 99,
		xp: 12.5,
		id: itemID('Dwarven greathammer'),
		inputBars: { [itemID('Dwarven bar')]: 4 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1,
		requiresBlacksmith: true,
		cantBeDoubled: true
	},
	{
		name: 'Dwarven pickaxe',
		level: 99,
		xp: 12.5,
		id: itemID('Dwarven pickaxe'),
		inputBars: { [itemID('Dwarven bar')]: 3 },
		timeToUse: Time.Second * 3.4,
		outputMultiple: 1,
		requiresBlacksmith: true,
		cantBeDoubled: true
	},
	{
		name: 'Dwarven warhammer',
		level: 120,
		xp: 100_000,
		id: itemID('Dwarven warhammer'),
		inputBars: { [itemID('Dwarven bar')]: 3, [itemID('Broken dwarven warhammer')]: 1 },
		timeToUse: Time.Minute * 3,
		outputMultiple: 1,
		requiresBlacksmith: true,
		cantBeDoubled: true
	},
	{
		name: 'Dwarven full helm',
		level: 120,
		xp: 100_000,
		id: itemID('Dwarven full helm'),
		inputBars: { [itemID('Dwarven bar')]: 2 },
		timeToUse: Time.Minute * 3,
		outputMultiple: 1,
		requiresBlacksmith: true,
		cantBeDoubled: true
	},
	{
		name: 'Dwarven platebody',
		level: 120,
		xp: 100_000,
		id: itemID('Dwarven platebody'),
		inputBars: { [itemID('Dwarven bar')]: 5 },
		timeToUse: Time.Minute * 3,
		outputMultiple: 1,
		requiresBlacksmith: true,
		cantBeDoubled: true
	},
	{
		name: 'Dwarven platelegs',
		level: 120,
		xp: 100_000,
		id: itemID('Dwarven platelegs'),
		inputBars: { [itemID('Dwarven bar')]: 4 },
		timeToUse: Time.Minute * 3,
		outputMultiple: 1,
		requiresBlacksmith: true,
		cantBeDoubled: true
	},
	{
		name: 'Dwarven gloves',
		level: 120,
		xp: 100_000,
		id: itemID('Dwarven gloves'),
		inputBars: { [itemID('Dwarven bar')]: 2 },
		timeToUse: Time.Minute * 3,
		outputMultiple: 1,
		requiresBlacksmith: true,
		cantBeDoubled: true
	},
	{
		name: 'Dwarven boots',
		level: 120,
		xp: 100_000,
		id: itemID('Dwarven boots'),
		inputBars: { [itemID('Dwarven bar')]: 2 },
		timeToUse: Time.Minute * 3,
		outputMultiple: 1,
		requiresBlacksmith: true,
		cantBeDoubled: true
	},
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

export default Dwarven;
