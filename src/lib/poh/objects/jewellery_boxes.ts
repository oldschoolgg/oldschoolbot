import { Bank } from 'oldschooljs';

import type { PoHObject } from '..';

export const JewelleryBoxes: PoHObject[] = [
	{
		id: 37_492,
		name: 'Basic jewellery box',
		slot: 'jewellery_box',
		level: 81,
		itemCost: new Bank()
			.add('Bolt of cloth')
			.add('Steel bar')
			.add('Games necklace(8)', 20)
			.add('Ring of dueling(8)', 20)
	},
	{
		id: 37_501,
		name: 'Fancy jewellery box',
		slot: 'jewellery_box',
		level: 86,
		itemCost: new Bank().add('Gold leaf').add('Skills necklace(4)', 20).add('Combat bracelet(4)', 20),
		requiredInPlace: 37_492
	},
	{
		id: 37_520,
		name: 'Ornate jewellery box',
		slot: 'jewellery_box',
		level: 91,
		itemCost: new Bank().add('Gold leaf', 2).add('Amulet of glory(4)', 20).add('Ring of wealth (5)', 20),
		requiredInPlace: 37_501
	}
];
