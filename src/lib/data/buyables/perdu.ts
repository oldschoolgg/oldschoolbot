import { Bank } from 'oldschooljs';

import resolveItems from '../../util/resolveItems';
import { diariesCL } from '../CollectionsExport';
import { Buyable } from './buyables';

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
	gpCost: 5000,
	ironmanPrice: 200,
	collectionLogReqs: resolveItems(book)
}));
