import { Bank } from 'oldschooljs';

import { resolveItems } from 'oldschooljs/dist/util/util';
import { diariesCL } from '../CollectionsExport';
import type { Buyable } from './buyables';

export const perduBuyables: Buyable[] = diariesCL.map(itemName => ({
	name: itemName,
	gpCost: 1000,
	ironmanPrice: 200,
	collectionLogReqs: resolveItems(itemName)
}));

export const prayerBooks: Buyable[] = [
	'Holy book',
	'Unholy book',
	'Book of law',
	'Book of balance',
	'Book of war',
	'Book of darkness'
].map(book => ({
	name: `Reclaim ${book}`,
	outputItems: new Bank({ [book]: 1 }),
	gpCost: 50_000,
	ironmanPrice: 12_000,
	collectionLogReqs: resolveItems(book)
}));

export const godCapes: Buyable[] = ['Guthix cape', 'Saradomin cape', 'Zamorak cape'].map(cape => ({
	name: `Reclaim ${cape}`,
	outputItems: new Bank({ [cape]: 1 }),
	gpCost: 100_000,
	ironmanPrice: 23_000,
	collectionLogReqs: resolveItems(cape)
}));
