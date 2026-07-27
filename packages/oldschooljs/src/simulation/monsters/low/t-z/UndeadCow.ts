import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const UndeadCowTable: LootTable = new LootTable().every('Bones').every('Cowhide').every(4287);

export const UndeadCow: SimpleMonster = new SimpleMonster({
	id: 2992,
	name: 'Undead cow',
	table: UndeadCowTable,
	aliases: ['undead cow']
});
