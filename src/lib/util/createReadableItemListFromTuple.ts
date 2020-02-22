import createTupleOfItemsFromBank from './createTupleOfItemsFromBank';
import { Bank } from '../types';

export default function createReadableItemListFromBank(itemBank: Bank) {
	return createTupleOfItemsFromBank(itemBank)
		.map(([name, qty]) => `${qty.toLocaleString()}x ${name}`)
		.join(', ');
}
