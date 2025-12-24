import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const MonkeyArcherTable: LootTable = new LootTable().every('Monkey bones').tertiary(35, 'Ensouled monkey head');

export const MonkeyArcher: SimpleMonster = new SimpleMonster({
	id: 5272,
	name: 'Monkey Archer',
	table: MonkeyArcherTable,
	aliases: ['monkey archer']
});
