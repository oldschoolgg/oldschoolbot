import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

export const CryptRatTable = new LootTable().every('Bones');

export default new SimpleMonster({
	id: 1679,
	name: 'Crypt rat',
	table: CryptRatTable,
	aliases: ['crypt rat']
});
