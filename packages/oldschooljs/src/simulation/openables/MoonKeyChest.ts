import { roll } from 'node-rng';

import { Bank } from '@/structures/Bank.js';
import { resolveItems } from '@/structures/Items.js';
import LootTable from '@/structures/LootTable.js';
import type { OpenableOpenOptions } from '@/structures/Openable.js';
import Openable from '@/structures/Openable.js';

const MoonKeyChestMainTable = new LootTable()
	.add('Dragonstone', 1, 20)
	.add('Dragon platelegs', 2, 10)
	.add('Nature rune', 500, 10)
	.add('Huasca seed', 6, 10)
	.add('Rune platebody', 6, 10)
	.add('Watermelon seed', 100, 10)
	.add('Sun-kissed bones', 100, 10)
	.add('Raw monkfish', 300, 10)
	.add('Uncut diamond', 50, 10)
	.add('Gold ore', 500, 1)
	.add('Coal', 1, 1)
	.add('Cabbage', 28, 1)
	.add('Crystal key', 1, 1)
	.add('Moon key', 1, 1)
	.add('Onyx bolts', 150, 1)
	.add('Spinach roll', 1, 1);

const moonKeyChestAllItems = Array.from(
	new Set([
		...MoonKeyChestMainTable.allItems,
		...resolveItems(['Sunfire splinters', 'Uncut onyx', 'Helmet of the moon'])
	])
);

export class MoonKeyChestOpenable extends Openable {
	constructor() {
		super({
			id: 30_109,
			name: 'Chest (moon key)',
			aliases: ['moon key chest', 'moon key'],
			allItems: moonKeyChestAllItems
		});
	}

	public override open(quantity = 1, _options: OpenableOpenOptions = {}): Bank {
		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			loot.add('Sunfire splinters', 250);

			if (roll(5000)) {
				loot.add('Uncut onyx');
				continue;
			}

			if (roll(500)) {
				loot.add('Helmet of the moon');
				continue;
			}

			loot.add(MoonKeyChestMainTable.roll());
		}

		return loot;
	}

	public get table(): LootTable {
		return MoonKeyChestMainTable;
	}
}

export const MoonKeyChest: MoonKeyChestOpenable = new MoonKeyChestOpenable();
