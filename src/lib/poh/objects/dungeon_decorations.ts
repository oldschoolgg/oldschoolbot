import { Bank } from 'oldschooljs';

import type { PoHObject } from '..';

export const DungeonDecorations: PoHObject[] = [
	{
		id: 13_312,
		name: 'Decorative blood',
		slot: 'dungeon_decoration',
		level: 72,
		itemCost: new Bank().add('Red dye', 4)
	},
	{
		id: 13_311,
		name: 'Decorative pipe',
		slot: 'dungeon_decoration',
		level: 83,
		itemCost: new Bank().add('Steel bar', 4)
	},
	{
		id: 13_310,
		name: 'Hanging skeleton',
		slot: 'dungeon_decoration',
		level: 94,
		itemCost: new Bank().add('Skull', 2).add('Bones', 6)
	}
];
