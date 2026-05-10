import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const GiantBatTable: LootTable = new LootTable().every('Bat bones');

export const GiantBat: SimpleMonster = new SimpleMonster({
	id: 2834,
	name: 'Giant Bat',
	table: GiantBatTable,
	aliases: ['giant bat']
});
