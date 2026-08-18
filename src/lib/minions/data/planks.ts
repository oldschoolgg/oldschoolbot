import { itemID } from 'oldschooljs';

import type { Plankable } from '@/lib/skilling/types.js';

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
	},
	{
		name: 'Verdant plank',
		inputItem: itemID('Verdant logs'),
		outputItem: itemID('Verdant plank'),
		gpCost: 8500
	},
	{
		name: 'Ancient verdant plank',
		inputItem: itemID('Ancient verdant logs'),
		outputItem: itemID('Ancient verdant plank'),
		gpCost: 8500
	},
	{
		name: 'Myconid plank (stem)',
		inputItem: itemID('Colossal stem'),
		outputItem: itemID('Myconid plank'),
		gpCost: 8500
	},
	{
		name: 'Myconid plank (cap)',
		inputItem: itemID('Ancient cap'),
		outputItem: itemID('Myconid plank'),
		gpCost: 8500
	},
	{
		name: 'Crystalline plank',
		inputItem: itemID('Dense crystal shard'),
		outputItem: itemID('Crystalline plank'),
		gpCost: 8500
	},
	{
		name: 'Elder plank',
		inputItem: itemID('Elder logs'),
		outputItem: itemID('Elder plank'),
		gpCost: 8500
	}
];
