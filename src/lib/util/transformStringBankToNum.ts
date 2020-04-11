import { StringKeyedBank, Bank } from '../types';
import getOSItem from './getOSItem';

export function transformStringBankToNum(stringBank: StringKeyedBank): Bank {
	const newBank: Bank = {};

	for (const [itemName, qty] of Object.entries(stringBank)) {
		newBank[getOSItem(itemName).id] = qty;
	}

	return newBank;
}
