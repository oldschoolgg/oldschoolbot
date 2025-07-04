import { Bank, itemID } from 'oldschooljs';

import type { Craftable } from '@/lib/skilling/types';

export const platinumCraftables: Craftable[] = [
	// Platinum
	{
		name: 'Platinum ring',
		id: itemID('Platinum ring'),
		level: 90,
		xp: 122,
		inputItems: new Bank().add('Platinum bar', 1),
		tickRate: 3
	},
	{
		name: 'Platinum necklace',
		id: itemID('Platinum necklace'),
		level: 91,
		xp: 122 * 2,
		inputItems: new Bank().add('Platinum bar', 2),
		tickRate: 3
	},
	{
		name: 'Platinum bracelet',
		id: itemID('Platinum bracelet'),
		level: 92,
		xp: 122 * 2,
		inputItems: new Bank().add('Platinum bar', 2),
		tickRate: 3
	},
	{
		name: 'Platinum amulet (unstrung)',
		id: itemID('Platinum amulet (unstrung)'),
		level: 93,
		xp: 122 * 2,
		inputItems: new Bank().add('Platinum bar', 2),
		tickRate: 3
	},
	{
		name: 'Platinum amulet',
		id: itemID('Platinum amulet'),
		level: 93,
		xp: 102 * 1,
		inputItems: new Bank().add('Platinum amulet (unstrung)', 1).add('Ball of wool', 1),
		tickRate: 3
	},
	// Moonstone
	{
		name: 'Moonstone ring',
		id: itemID('Moonstone ring'),
		level: 90,
		xp: 122,
		inputItems: new Bank().add('Platinum bar', 1).add('Moonstone'),
		tickRate: 3
	},
	{
		name: 'Moonstone necklace',
		id: itemID('Moonstone necklace'),
		level: 91,
		xp: 122 * 2,
		inputItems: new Bank().add('Platinum bar', 2).add('Moonstone'),
		tickRate: 3
	},
	{
		name: 'Moonstone bracelet',
		id: itemID('Moonstone bracelet'),
		level: 92,
		xp: 122 * 2,
		inputItems: new Bank().add('Platinum bar', 2).add('Moonstone'),
		tickRate: 3
	},
	{
		name: 'Moonstone amulet (unstrung)',
		id: itemID('Moonstone amulet (unstrung)'),
		level: 93,
		xp: 122 * 2,
		inputItems: new Bank().add('Platinum bar', 2).add('Moonstone'),
		tickRate: 3
	},
	{
		name: 'Moonstone amulet',
		id: itemID('Moonstone amulet'),
		level: 93,
		xp: 102 * 1,
		inputItems: new Bank().add('Moonstone amulet (unstrung)', 1).add('Ball of wool', 1),
		tickRate: 3
	}
];

export const platinumEnchantables: Craftable[] = [];
