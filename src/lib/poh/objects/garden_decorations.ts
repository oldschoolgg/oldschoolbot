import { Bank } from 'oldschooljs';

import { PoHObject } from '..';

const cost = new Bank().add('Magic stone', 2);

const GardenDecorations: PoHObject[] = [
	{
		id: 425,
		name: 'Skotizo decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add('Jar of darkness'),
		refundItems: true
	},
	{
		id: 2042,
		name: 'Zulrah decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add('Jar of swamp'),
		refundItems: true
	},
	{
		id: 3564,
		name: 'Avatar of Creation decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add('Blue soul cape'),
		refundItems: true
	},
	{
		id: 3566,
		name: 'Avatar of Destruction decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add('Red soul cape'),
		refundItems: true
	},
	{
		id: 5866,
		name: 'Cerberus decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add('Jar of souls'),
		refundItems: true
	},
	{
		id: 5889,
		name: 'Abyssal Sire decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add('Jar of miasma'),
		refundItems: true
	},
	{
		id: 5893,
		name: 'Jad decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add('Fire cape'),
		refundItems: true
	},
	{
		id: 6492,
		name: 'Armadyl decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add("Pet kree'arra"),
		refundItems: true
	},
	{
		id: 6493,
		name: 'Saradomin decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add('Pet zilyana'),
		refundItems: true
	},
	{
		id: 6494,
		name: 'Bandos decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add('Pet general graardor'),
		refundItems: true
	},
	{
		id: 6495,
		name: 'Zamorak decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add("Pet k'ril tsutsaroth"),
		refundItems: true
	},
	{
		id: 6642,
		name: 'Penance Queen decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add('Pet penance queen'),
		refundItems: true
	},
	{
		id: 7542,
		name: 'Tekton decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add('Tektiny'),
		refundItems: true
	},
	{
		id: 494,
		name: 'Kraken decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add('Jar of dirt'),
		refundItems: true
	},
	{
		id: 9398,
		name: 'Nightmare decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add('Jar of dreams'),
		refundItems: true
	},
	{
		id: 8713,
		name: 'Sarachnis decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add('Jar of eyes'),
		refundItems: true
	},
	{
		id: 8060,
		name: 'Vorkath decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add('Jar of decay'),
		refundItems: true
	},
	{
		id: 499,
		name: 'Thermy decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add('Jar of smoke'),
		refundItems: true
	},
	{
		id: 8010,
		name: 'Corporeal Beast decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add('Jar of spirits'),
		refundItems: true
	},
	{
		id: 7889,
		name: 'Grotesque guardian decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add('Jar of stone'),
		refundItems: true
	},
	{
		id: 6500,
		name: 'Kalphite Queen decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add('Jar of sand'),
		refundItems: true
	},
	{
		id: 8011,
		name: 'Zuk decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add('Infernal cape').add('Jal-nib-rek'),
		refundItems: true
	},
	{
		id: 34_677,
		name: 'Verzik Vitur decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add("Lil' zik"),
		refundItems: true
	},
	{
		id: 29_944,
		name: 'Olm decoration',
		slot: 'gardenDecoration',
		level: 99,
		itemCost: cost.clone().add('Olmlet'),
		refundItems: true
	}
];

export { GardenDecorations };
