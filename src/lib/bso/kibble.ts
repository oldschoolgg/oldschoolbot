import { type Item, Items } from 'oldschooljs';

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
		item: Items.getOrThrow('Simple kibble'),
		type: 'simple',
		minimumFishHeal: 1,
		cropComponent: Items.resolveFullItems(['Cabbage', 'Potato', 'Avocado']),
		herbComponent: Items.resolveFullItems(['Marrentill', 'Tarromin']),
		xp: 600,
		level: 105
	},
	{
		item: Items.getOrThrow('Delicious kibble'),
		type: 'delicious',
		minimumFishHeal: 19,
		cropComponent: Items.resolveFullItems(['Strawberry', 'Papaya fruit', 'Mango']),
		herbComponent: Items.resolveFullItems(['Cadantine', 'Kwuarm']),
		xp: 900,
		level: 110
	},
	{
		item: Items.getOrThrow('Extraordinary kibble'),
		type: 'extraordinary',
		minimumFishHeal: 26,
		cropComponent: Items.resolveFullItems(['Orange', 'Pineapple', 'Lychee']),
		herbComponent: Items.resolveFullItems(['Torstol', 'Dwarf weed']),
		xp: 1100,
		level: 120
	}
];

export const kibbleCL = kibbles.map(i => i.item.id);
