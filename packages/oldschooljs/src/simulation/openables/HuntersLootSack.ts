import LootTable from '@/structures/LootTable.js';
import { SimpleOpenable } from '@/structures/SimpleOpenable.js';

const SackLogTable: LootTable = new LootTable()
	.add('Maple logs', 4)
	.add('Yew logs', 4)
	.add('Teak logs', 4)
	.add('Mahogany logs', 4)
	.add('Magic logs', 4);

const SackHerbTable: LootTable = new LootTable()
	.add('Grimy harralander', 4)
	.add('Grimy irit leaf', 4)
	.add('Grimy avantoe', 4)
	.add('Grimy ranarr weed', 4)
	.add('Grimy cadantine', 4)
	.add('Grimy kwuarm', 4)
	.add('Grimy lantadyme', 4);

const BasicSackTable: LootTable = new LootTable()
	.add('Quetzal feed', 1)
	.add('Coins', [750, 1_250])
	.add('Hunter spear tips', [15, 30])
	.add('Blessed bone shards', [100, 200])
	.add('Raw kyatt', 2)
	.add('Raw pyre fox', 3)
	.add(SackLogTable);

const BSackTable: LootTable = new LootTable().every(BasicSackTable, 5);

const AdeptSackTable: LootTable = new LootTable()
	.add('Quetzal feed', 1)
	.add('Coins', [750, 1_250])
	.add('Hunter spear tips', [15, 30])
	.add('Blessed bone shards', [100, 200])
	.add('Raw kyatt', 2)
	.add('Raw pyre fox', 3)
	.add(5_075, 1)
	.add(5_075, [2, 3])
	.add('Raw sunlight antelope', 2)
	.add('Sun-kissed bones', 2)
	.add(SackLogTable)
	.add(SackHerbTable);

const ASackTable: LootTable = new LootTable().every(AdeptSackTable, 7);

const ExpertSackTable: LootTable = new LootTable()
	.add('Quetzal feed', 1)
	.add('Coins', [750, 1_250])
	.add('Coins', [2_500, 3_500])
	.add('Hunter spear tips', [15, 30])
	.add('Blessed bone shards', [100, 200])
	.add('Raw kyatt', 2)
	.add('Raw pyre fox', 3)
	.add(5_075, 1)
	.add(5_075, [2, 3])
	.add('Raw sunlight antelope', 2)
	.add('Raw moonlight antelope', 2)
	.add('Sun-kissed bones', 2)
	.add('Sun-kissed bones', 3)
	.add(SackLogTable)
	.add(SackHerbTable);

const ESackTable: LootTable = new LootTable().every(ExpertSackTable, 9);

const MasterSackTable: LootTable = new LootTable()
	.add('Quetzal feed', 1)
	.add('Coins', [750, 1_250])
	.add('Coins', [2_500, 3_500])
	.add('Hunter spear tips', [15, 30])
	.add('Blessed bone shards', [100, 200])
	.add('Raw kyatt', 2)
	.add('Raw pyre fox', 3)
	.add(5_075, 1)
	.add(5_075, [2, 3])
	.add('Raw sunlight antelope', 2)
	.add('Raw moonlight antelope', 2)
	.add('Sun-kissed bones', 2)
	.add('Sun-kissed bones', 3)
	.add(SackLogTable)
	.add(SackHerbTable);

const MSackTable: LootTable = new LootTable().every(MasterSackTable, 11);

export const BasicSack: SimpleOpenable = new SimpleOpenable({
	id: 29_242,
	name: "Hunters' loot sack (basic)",
	aliases: ['basic hunter sack', "hunter's loot sack (basic)", 'hunters loot sack (basic)'],
	table: BSackTable
});

export const AdeptSack: SimpleOpenable = new SimpleOpenable({
	id: 29_244,
	name: "Hunters' loot sack (adept)",
	aliases: ['adept hunter sack', "hunter's loot sack (adept)", 'hunters loot sack (adept)'],
	table: ASackTable
});

export const ExpertSack: SimpleOpenable = new SimpleOpenable({
	id: 29_246,
	name: "Hunters' loot sack (expert)",
	aliases: ['expert hunter sack', "hunter's loot sack (expert)", 'hunters loot sack (expert)'],
	table: ESackTable
});

export const MasterSack: SimpleOpenable = new SimpleOpenable({
	id: 29_248,
	name: "Hunters' loot sack (master)",
	aliases: ['master hunter sack', "hunter's loot sack (master)", 'hunters loot sack (master)'],
	table: MSackTable
});
