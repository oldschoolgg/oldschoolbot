import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

export const GiantCryptSpiderTable = new LootTable();

export default new SimpleMonster({
	id: 1684,
	name: 'Giant crypt spider',
	table: GiantCryptSpiderTable,
	aliases: ['giant crypt spider']
});
