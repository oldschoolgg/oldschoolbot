import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const JackalTable: LootTable = new LootTable().every('Bones');
export const Jackal: SimpleMonster = new SimpleMonster({
	id: 4185,
	name: 'Jackal',
	table: JackalTable,
	aliases: ['jackal']
});
