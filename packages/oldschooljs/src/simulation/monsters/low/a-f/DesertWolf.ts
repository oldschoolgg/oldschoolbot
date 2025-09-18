import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

export const DesertWolfTable = new LootTable().every('Wolf bones');

export default new SimpleMonster({
	id: 4649,
	name: 'Desert Wolf',
	table: DesertWolfTable,
	aliases: ['desert wolf']
});
