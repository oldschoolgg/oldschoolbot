import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const ZombieRatTable: LootTable = new LootTable().every('Bones');

export const ZombieRat: SimpleMonster = new SimpleMonster({
	id: 3969,
	name: 'Zombie rat',
	table: ZombieRatTable,
	aliases: ['zombie rat']
});
