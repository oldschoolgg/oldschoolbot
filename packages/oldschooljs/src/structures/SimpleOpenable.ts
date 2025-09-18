import type { OpenableOptions } from '../meta/types.js';
import { Bank } from './Bank.js';
import type LootTable from './LootTable.js';
import Openable from './Openable.js';

interface SimpleOpenableOptions extends OpenableOptions {
	table: LootTable;
}

export class SimpleOpenable extends Openable {
	public table: LootTable;

	constructor(options: SimpleOpenableOptions) {
		super({ ...options, allItems: options.table.allItems });
		this.table = options.table;
	}

	public open(quantity = 1) {
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			loot.add(this.table.roll());
		}

		return loot;
	}
}
