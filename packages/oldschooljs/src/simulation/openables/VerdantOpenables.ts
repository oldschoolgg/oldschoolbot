import { randInt } from '@oldschoolgg/rng';

import LootTable from '@/structures/LootTable.js';
import { SimpleOpenable } from '@/structures/SimpleOpenable.js';

const GemstoneBundleTable: LootTable = new LootTable()
	.add(75_051, 1, 10)
	.add(75_052, 1, 10)
	.add(75_053, 1, 10)
	.add(75_054, 1, 10)
	.add(75_055, 1, 10)
	.add(75_056, 1, 1);

const BundleTable: LootTable = new LootTable().every(GemstoneBundleTable, randInt(3, 6));

export const GemstoneBundle: SimpleOpenable = new SimpleOpenable({
	id: 75_022,
	name: 'Gemstone bundle',
	aliases: ['gemstone bundle', 'gem bundle'],
	table: BundleTable
});

const GemstoneSatchelTable: LootTable = new LootTable()
	.add(75_051, 1, 30)
	.add(75_052, 1, 30)
	.add(75_053, 1, 30)
	.add(75_054, 1, 30)
	.add(75_055, 1, 30)
	.add(75_056, 1, 3);

const SatchelTable: LootTable = new LootTable().every(GemstoneSatchelTable, randInt(8, 12));

export const GemstoneSatchel: SimpleOpenable = new SimpleOpenable({
	id: 75_023,
	name: 'Gemstone satchel',
	aliases: ['gemstone satchel', 'gem satchel'],
	table: SatchelTable
});

const GemstoneCoreTable: LootTable = new LootTable()
	.add(75_051, 1, 50)
	.add(75_052, 1, 50)
	.add(75_053, 1, 50)
	.add(75_054, 1, 50)
	.add(75_055, 1, 50)
	.add(75_056, 1, 5);

const CoreTable: LootTable = new LootTable().every(GemstoneCoreTable, randInt(15, 20));

export const GemstoneCore: SimpleOpenable = new SimpleOpenable({
	id: 75_024,
	name: 'Gem core',
	aliases: ['gemstone core', 'gem core'],
	table: CoreTable
});

const ElderHoardBase: LootTable = new LootTable()
	.add(75_051, 1, 10)
	.add(75_052, 1, 10)
	.add(75_053, 1, 10)
	.add(75_054, 1, 10)
	.add(75_055, 1, 10)
	.add(75_056, 1, 1)
	.add(50_021, randInt(1, 250), 4)
	.add(50_018, randInt(1, 25), 4)
	.add(75_021, randInt(1, 50), 2)
	.add(75_048, 1, 1)
	.add(73_128, 1, 1)
	.add(19_837, 1, 1);
	// .add(75_047, 1, 1)

const ElderHoardTable: LootTable = new LootTable().every(ElderHoardBase, randInt(3, 6));

export const ElderHoard: SimpleOpenable = new SimpleOpenable({
	id: 75_024,
	name: 'Elder Cache',
	aliases: ['elder cache', 'elder sigil'],
	table: ElderHoardTable
});