import { Bank } from 'oldschooljs';

import { itemNameFromID } from '../../util';
import resolveItems from '../../util/resolveItems';
import { diariesCL } from '../CollectionsExport';
import { Buyable } from './buyables';

export const perduBuyables: Buyable[] = diariesCL.map(itemName => ({
	name: itemNameFromID(itemName)!,
	gpCost: 1000,
	ironmanPrice: 200,
	collectionLogReqs: [itemName]
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
