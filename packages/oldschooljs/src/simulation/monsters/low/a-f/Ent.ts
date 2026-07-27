import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const LogTable: LootTable = new LootTable()
	.add('Logs', 1, 10)
	.add('Oak logs', 2, 8)
	.add('Willow logs', 2, 6)
	.add('Maple logs', 2, 4)
	.add('Yew logs', 2, 2)
	.add('Magic logs', 2, 1);

export const EntTable: LootTable = new LootTable().tertiary(256, 'Bird nest').add(LogTable, 1, 1).add(LogTable, 2, 1);

export const Ent: SimpleMonster = new SimpleMonster({
	id: 6594,
	name: 'Ent',
	table: EntTable,
	aliases: ['ent']
});
