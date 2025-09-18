import { itemID } from 'oldschooljs';

import type { Plankable } from '../../skilling/types.js';

export const Planks: Plankable[] = [
	{
		name: 'Plank',
		inputItem: itemID('Logs'),
		outputItem: itemID('Plank'),
		gpCost: 100
	},
	{
		name: 'Oak plank',
		inputItem: itemID('Oak logs'),
		outputItem: itemID('Oak plank'),
		gpCost: 250
	},
	{
		name: 'Teak plank',
		inputItem: itemID('Teak logs'),
		outputItem: itemID('Teak plank'),
		gpCost: 500
	},
	{
		name: 'Mahogany plank',
		inputItem: itemID('Mahogany logs'),
		outputItem: itemID('Mahogany plank'),
		gpCost: 1500
	}
];
