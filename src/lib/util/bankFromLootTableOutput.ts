import { Bank } from '../types';
import { ReturnedLootItem } from 'oldschooljs/dist/meta/types';

export default function bankFromLootTableOutput(tableOutput: ReturnedLootItem[]) {
	const newBank: Bank = {};

	for (const { item, quantity } of tableOutput) {
		if (newBank[item]) newBank[item] += quantity;
		else newBank[item] = quantity;
	}

	return newBank;
}
