import { Bank } from './types';
import itemID from './util/itemID';
import { MAX_QP } from './constants';

interface Buyable {
	name: string;
	outputItems: Bank;
	qpRequired: number;
	gpCost: number;
}

const Buyables: Buyable[] = [
	{
		name: 'Quest Cape',
		outputItems: {
			[itemID('Quest point cape')]: 1,
			[itemID('Quest point hood')]: 1
		},
		qpRequired: MAX_QP,
		gpCost: 99_000
	},
	{
		name: 'Goldsmith gauntlets',
		outputItems: {
			[itemID('Goldsmith gauntlets')]: 1
		},
		qpRequired: 35,
		gpCost: 1_000_000
	}
];

export default Buyables;
