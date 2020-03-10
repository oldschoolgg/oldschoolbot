import { Bank } from '../types';

export default function bankHasItem(itemBank: Bank, itemID: number, quantity = 1) {
	return typeof itemBank[itemID] === 'number' && itemBank[itemID] >= quantity;
}
