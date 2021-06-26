import { Bank } from 'oldschooljs';

import { PoHObject } from '..';

export const DungeonDecorations: PoHObject[] = [
	{
		id: 13312,
		name: 'Decorative blood',
		slot: 'dungeonDecoration',
		level: 72,
		itemCost: new Bank().add('Red dye', 4)
	},
	{
		id: 13311,
		name: 'Decorative pipe',
		slot: 'dungeonDecoration',
		level: 83,
		itemCost: new Bank().add('Steel bar', 4)
	},
	{
		id: 13310,
		name: 'Hanging skeleton',
		slot: 'dungeonDecoration',
		level: 94,
		itemCost: new Bank().add('Skull', 2).add('Bones', 6)
	}
];
