import { Item } from 'oldschooljs/dist/meta/types';

import getOSItem from '../util/getOSItem';

export interface Kibble {
	item: Item;
	type: 'simple' | 'delicious' | 'extraordinary';
	minimumFishHeal: number;
	cropComponent: Item[];
	herbComponent: Item[];
	xp: number;
	level: number;
}

export const kibbles: Kibble[] = [
	{
		item: getOSItem('Simple kibble'),
		type: 'simple',
		minimumFishHeal: 1,
		cropComponent: ['Cabbage', 'Potato', 'Avocado'].map(getOSItem),
		herbComponent: ['Marrentill', 'Tarromin'].map(getOSItem),
		xp: 600,
		level: 105
	},
	{
		item: getOSItem('Delicious kibble'),
		type: 'delicious',
		minimumFishHeal: 19,
		cropComponent: ['Strawberry', 'Papaya fruit', 'Mango'].map(getOSItem),
		herbComponent: ['Cadantine', 'Kwuarm'].map(getOSItem),
		xp: 900,
		level: 110
	},
	{
		item: getOSItem('Extraordinary kibble'),
		type: 'extraordinary',
		minimumFishHeal: 26,
		cropComponent: ['Orange', 'Pineapple', 'Lychee'].map(getOSItem),
		herbComponent: ['Torstol', 'Dwarf weed'].map(getOSItem),
		xp: 1100,
		level: 120
	}
];

export const kibbleCL = kibbles.map(i => i.item.id);
