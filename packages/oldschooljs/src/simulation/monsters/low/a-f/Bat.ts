import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const BatTable: LootTable = new LootTable().every('Bat bones');
export const Bat: SimpleMonster = new SimpleMonster({
	id: 2827,
	name: 'Bat',
	table: BatTable,
	aliases: ['bat']
});
