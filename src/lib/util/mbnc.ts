import ClueTiers from '../minions/data/clueTiers';
import { ItemBank } from '../types';

export function multiplyBankNotClues(bank: ItemBank, multiplier: number) {
	let newBank: ItemBank = {};
	for (const [id, qty] of Object.entries(bank)) {
		if (ClueTiers.some(t => t.scrollID === parseInt(id))) continue;
		newBank[id] = qty * multiplier;
	}
	return newBank;
}
