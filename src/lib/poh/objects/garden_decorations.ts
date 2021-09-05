import { Bank } from 'oldschooljs';

import { PoHObject } from '..';

const GardenDecorations: PoHObject[] = [
	{
		id: 29_169,
		name: 'Mounted fire cape',
		slot: 'gardenDecoration',
		level: 80,
		itemCost: new Bank().add('Marble block').add('Gold leaf').add('Fire cape')
	}
];

for (const obj of GardenDecorations) {
	obj.refundItems = true;
}

export { GardenDecorations };
