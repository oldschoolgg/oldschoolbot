import { Bank, StringKeyedBank } from '../types';

export default function addArrayOfBanks(arrayOfBanks: readonly Bank[]) {
	const newBank: StringKeyedBank = {};

	for (const bank of arrayOfBanks) {
		for (const [itemID, quantity] of Object.entries(bank)) {
			if (newBank[itemID]) newBank[itemID] += quantity;
			else newBank[itemID] = quantity;
		}
	}

	return newBank;
}
