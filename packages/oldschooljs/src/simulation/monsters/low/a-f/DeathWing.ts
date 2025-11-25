import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const DeathWingTable: LootTable = new LootTable().tertiary(128, 'Clue scroll (beginner)');

export const DeathWing: SimpleMonster = new SimpleMonster({
	id: 509,
	name: 'Death wing',
	table: DeathWingTable,
	aliases: ['death wing']
});
