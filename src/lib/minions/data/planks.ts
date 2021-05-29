import { Plankable } from '../../skilling/types';
import itemID from '../../util/itemID';

export const Planks: Plankable[] = [
	{
		name: 'Logs',
		inputItem: itemID('Logs'),
		outputItem: itemID('Plank'),
		gpCost: 100
	},
	{
		name: 'Oak',
		inputItem: itemID('Oak logs'),
		outputItem: itemID('Oak plank'),
		gpCost: 250
	},
	{
		name: 'Teak',
		inputItem: itemID('Teak logs'),
		outputItem: itemID('Teak plank'),
		gpCost: 500
	},
	{
		name: 'Mahogany',
		inputItem: itemID('Mahogany logs'),
		outputItem: itemID('Mahogany plank'),
		gpCost: 1500
	},
	{
		name: 'Elder',
		inputItem: itemID('Elder logs'),
		outputItem: itemID('Elder plank'),
		gpCost: 8_500
	}
];
