import { diariesCL } from '../CollectionsExport';
import { Buyable } from './buyables';

export const perduBuyables: Buyable[] = diariesCL.map(itemName => ({
	name: itemName,
	gpCost: 1000,
	ironmanPrice: 200,
	collectionLogReqs: [itemName]
}));
