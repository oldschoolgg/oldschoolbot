import { LootTable } from 'oldschooljs';

import { HighSeedPackTable, LowSeedPackTable, MediumSeedPackTable } from '../../../../data/seedPackTables';

export const TanglerootTable = new LootTable().add(20_661).add(24_555).add(24_557).add(24_559).add(24_561).add(24_563);

export const GrimyHerbTable = new LootTable()
	.add('Grimy guam leaf', [20, 50])
	.add('Grimy marrentill', [20, 50])
	.add('Grimy tarromin', [20, 20])
	.add('Grimy harralander', [5, 20])
	.add('Grimy ranarr weed', [5, 20])
	.add('Grimy irit leaf', [5, 20])
	.add('Grimy avantoe', [5, 20])
	.add('Grimy kwuarm', [5, 20])
	.add('Grimy cadantine', [5, 20])
	.add('Grimy dwarf weed', [5, 20])
	.add('Grimy torstol', [5, 20])
	.add('Grimy lantadyme', [5, 20])
	.add('Grimy toadflax', [5, 20])
	.add('Grimy snapdragon', [5, 20]);

const CleanHerbTable = new LootTable()
	.add('Guam leaf', [5, 20])
	.add('Marrentill', [5, 20])
	.add('Tarromin', [5, 20])
	.add('Harralander', [5, 20])
	.add('Ranarr weed', [5, 20])
	.add('Toadflax', [5, 20])
	.add('Irit leaf', [5, 20])
	.add('Avantoe', [5, 20])
	.add('Kwuarm', [5, 20])
	.add('Snapdragon', [5, 20])
	.add('Cadantine', [5, 20])
	.add('Lantadyme', [5, 20])
	.add('Dwarf weed', [5, 20])
	.add('Torstol', [5, 20]);

const AllSeedTables = new LootTable().add(LowSeedPackTable).add(MediumSeedPackTable).add(HighSeedPackTable);

const HerbSecondaries = new LootTable()
	.add('Unicorn horn dust', [30, 95])
	.add('Eye of newt', [30, 95])
	.add('Limpwurt root', [30, 95])
	.add('Volcanic ash', [30, 95])
	.add("Red spiders' eggs", [30, 95])
	.add('Garlic', [30, 95])
	.add('White berries', [30, 95])
	.add("Toad's legs", [30, 95])
	.add('Snape grass', [200, 300])
	.add('Mort myre fungus', [30, 50])
	.add('Coconut milk', [30, 50])
	.add('Poison ivy berries', [30, 50])
	.add('Crushed nest', [30, 100]);

const LogTable = new LootTable().add('Yew logs', [20, 50]).add('Magic logs', [10, 40]).add('Redwood logs', [5, 30]);

const DeadLumberjackTable = new LootTable().every('Lumberjack hat').every('Bones').every('Skull').every('Iron axe');

export const TreebeardLootTable = new LootTable()
	.tertiary(1200, TanglerootTable)
	.tertiary(800, 'Ivy seed')
	.tertiary(150, 'Clue scroll (master)')
	.tertiary(300, DeadLumberjackTable)
	.tertiary(120, 'Mysterious seed')
	.tertiary(100, 'Ent hide')
	.tertiary(25, 'Korulsi seed')
	.tertiary(15, 'Crystal acorn')
	.tertiary(35, 'Grand crystal acorn', [1, 3])
	.every(AllSeedTables, [1, 2])
	.add('Elder logs', [5, 25])
	.add(AllSeedTables, [1, 4])
	.add(CleanHerbTable, [1, 3])
	.add(HerbSecondaries, [1, 7])
	.add(GrimyHerbTable, [1, 3])
	.add(LogTable, [10, 20]);
