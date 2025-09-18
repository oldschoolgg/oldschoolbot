import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

export const JungleWolfTable = new LootTable().every('Wolf bones');

export default new SimpleMonster({
	id: 232,
	name: 'Jungle Wolf',
	table: JungleWolfTable,
	aliases: ['jungle wolf']
});
