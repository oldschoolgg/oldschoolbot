import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const ScrollTable = new LootTable().add('Skeleton champion scroll').add('Zombie champion scroll');

export const UndeadOneTable = new LootTable().every('Bones').tertiary(5000, ScrollTable);

export default new SimpleMonster({
	id: 5342,
	name: 'Undead one',
	table: UndeadOneTable,
	aliases: ['undead one']
});
