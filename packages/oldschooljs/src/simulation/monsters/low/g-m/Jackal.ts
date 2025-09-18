import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const JackalTable = new LootTable().every('Bones');
export default new SimpleMonster({
	id: 4185,
	name: 'Jackal',
	table: JackalTable,
	aliases: ['jackal']
});
