import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

export const MonkeyGuardTable = new LootTable().every('Monkey bones').tertiary(35, 'Ensouled monkey head');

export default new SimpleMonster({
	id: 5271,
	name: 'Monkey Guard',
	table: MonkeyGuardTable,
	aliases: ['monkey guard']
});
