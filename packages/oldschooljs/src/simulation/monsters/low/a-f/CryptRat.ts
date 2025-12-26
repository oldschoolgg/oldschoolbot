import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const CryptRatTable: LootTable = new LootTable().every('Bones');

export const CryptRat: SimpleMonster = new SimpleMonster({
	id: 1679,
	name: 'Crypt rat',
	table: CryptRatTable,
	aliases: ['crypt rat']
});
