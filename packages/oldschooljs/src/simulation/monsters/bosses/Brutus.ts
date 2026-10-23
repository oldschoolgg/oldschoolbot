import { EMonster } from '@/EMonster.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const SupplyTable = new LootTable()
	.add('Iron full helm', 1, 2)
	.add('Iron platebody', 1, 2)
	.add('Iron platelegs', 1, 1)
	.add('Iron plateskirt', 1, 1)
	.add('Iron arrow', 14, 10)
	.add('Air rune', 29, 10)
	.add('Mind rune', 18, 8)
	.add('Chaos rune', 12, 2)
	.add('Potato seed', 3, 10)
	.add('Acorn', 2, 5)
	.add('Raw t-bone steak', 3, 10)
	.add('Cowhide', 1, 10)
	.add('Oak logs', 2, 5)
	.add('Logs', 2, 5);

const BrutusTable = new LootTable({ limit: 150 })
	.every('Bull bones')
	.every('Raw t-bone steak')
	.add('Mooleta', 1, 5)
	.add('Bottomless milk bucket (empty)', 1, 4)
	.add('Cow slippers', 1, 1)
	.add(SupplyTable, 1, 140)
	.tertiary(15, 'Clue scroll (beginner)')
	.tertiary(40, 'Clue scroll (easy)')
	.tertiary(1000, 'Beef');

export const Brutus: SimpleMonster = new SimpleMonster({
	id: EMonster.BRUTUS,
	name: 'Brutus',
	table: BrutusTable,
	aliases: ['brutus']
});
