import { Bank } from '../types';
import { addBankToBank } from '../util';

export default function addArrayOfBanks(arrayOfBanks: Bank[]) {
	let newBank = {};

	for (const bank of arrayOfBanks) {
		newBank = addBankToBank(bank, newBank);
	}

	return newBank;
}
