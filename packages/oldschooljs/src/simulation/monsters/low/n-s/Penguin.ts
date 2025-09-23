import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const PenguinTable = new LootTable().every('Bones');

export default new SimpleMonster({
	id: 2063,
	name: 'Penguin',
	table: PenguinTable,
	aliases: ['penguin']
});
