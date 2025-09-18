import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const ZombieRatTable = new LootTable().every('Bones');

export default new SimpleMonster({
	id: 3969,
	name: 'Zombie rat',
	table: ZombieRatTable,
	aliases: ['zombie rat']
});
