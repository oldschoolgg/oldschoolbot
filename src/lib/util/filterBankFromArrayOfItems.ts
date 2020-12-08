import { ItemBank } from '../types';

/**
 * Given a list of items, and a bank, it will return a new bank with all items not
 * in the filter removed from the bank.
 * @param itemFilter The array of item IDs to use as the filter.
 * @param bank The bank to filter items from.
 */
export default function filterBankFromArrayOfItems(itemFilter: number[], bank: ItemBank): ItemBank {
	const returnBank: ItemBank = {};
	const bankKeys = Object.keys(bank);

	// If there are no items in the filter or bank, just return an empty bank.
	if (itemFilter.length === 0 || bankKeys.length === 0) return returnBank;

	// For every item in the filter, if its in the bank, add it to the return bank.
	for (const itemID of itemFilter) {
		if (bank[itemID]) returnBank[itemID] = bank[itemID];
	}

	return returnBank;
}
