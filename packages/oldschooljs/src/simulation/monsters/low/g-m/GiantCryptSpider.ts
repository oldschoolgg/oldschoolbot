import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const GiantCryptSpiderTable: LootTable = new LootTable();

export const GiantCryptSpider: SimpleMonster = new SimpleMonster({
	id: 1684,
	name: 'Giant crypt spider',
	table: GiantCryptSpiderTable,
	aliases: ['giant crypt spider']
});
