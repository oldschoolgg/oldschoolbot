import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

export const MonkeyArcherTable = new LootTable().every('Monkey bones').tertiary(35, 'Ensouled monkey head');

export default new SimpleMonster({
	id: 5272,
	name: 'Monkey Archer',
	table: MonkeyArcherTable,
	aliases: ['monkey archer']
});
