import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const ScrollTable: LootTable = new LootTable().add('Skeleton champion scroll').add('Zombie champion scroll');

export const UndeadOneTable: LootTable = new LootTable().every('Bones').tertiary(5000, ScrollTable);

export const UndeadOne: SimpleMonster = new SimpleMonster({
	id: 5342,
	name: 'Undead one',
	table: UndeadOneTable,
	aliases: ['undead one']
});
