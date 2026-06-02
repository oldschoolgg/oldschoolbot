import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const JungleWolfTable: LootTable = new LootTable().every('Wolf bones');

export const JungleWolf: SimpleMonster = new SimpleMonster({
	id: 232,
	name: 'Jungle Wolf',
	table: JungleWolfTable,
	aliases: ['jungle wolf']
});
