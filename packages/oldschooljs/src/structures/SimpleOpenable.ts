import type { OpenableOptions } from '../meta/types';
import Bank from './Bank';
import type LootTable from './LootTable';
import Openable from './Openable';

interface SimpleOpenableOptions extends OpenableOptions {
	table: LootTable;
}

export default class SimpleOpenable extends Openable {
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
