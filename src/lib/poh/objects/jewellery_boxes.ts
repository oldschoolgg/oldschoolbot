import { Bank } from 'oldschooljs';

import { PoHObject } from '..';

export const JewelleryBoxes: PoHObject[] = [
	{
		id: 37492,
		name: 'Basic jewellery box',
		slot: 'jewelleryBox',
		level: 81,
		itemCost: new Bank()
			.add('Bolt of cloth')
			.add('Steel bar')
			.add('Games necklace(8)', 99999)
			.add('Ring of dueling(8)', 9999)
	},
	{
		id: 37501,
		name: 'Fancy jewellery box',
		slot: 'jewelleryBox',
		level: 86,
		itemCost: new Bank()
			.add('Gold leaf')
			.add('Skills necklace(4)', 9999)
			.add('Combat bracelet(4)', 9999),
		requiredInPlace: 37492
	},
	{
		id: 37520,
		name: 'Ornate jewellery box',
		slot: 'jewelleryBox',
		level: 91,
		itemCost: new Bank()
			.add('Gold leaf', 2)
			.add('Amulet of glory(4)', 9999)
			.add('Ring of wealth (5)'),
		requiredInPlace: 37501
	}
];
