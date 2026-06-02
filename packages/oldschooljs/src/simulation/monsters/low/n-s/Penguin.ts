import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const PenguinTable: LootTable = new LootTable().every('Bones');

export const Penguin: SimpleMonster = new SimpleMonster({
	id: 2063,
	name: 'Penguin',
	table: PenguinTable,
	aliases: ['penguin']
});
