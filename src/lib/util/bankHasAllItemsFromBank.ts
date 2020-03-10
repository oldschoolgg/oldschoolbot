import { Bank } from '../types';
import bankHasItem from './bankHasItem';

export function bankHasAllItemsFromBank(bankToCheck: Bank, bankToHave: Bank) {
	const itemsToHave: [string, number][] = Object.entries(bankToHave);

	for (const [itemID, qty] of itemsToHave) {
		if (!bankHasItem(bankToCheck, parseInt(itemID), qty)) {
			return false;
		}
	}

	return true;
}
