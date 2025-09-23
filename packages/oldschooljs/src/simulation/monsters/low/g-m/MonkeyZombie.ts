import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const MonkeyZombieTable = new LootTable().every('Monkey bones');

export default new SimpleMonster({
	id: 5281,
	name: 'Monkey Zombie',
	table: MonkeyZombieTable,
	aliases: ['monkey zombie']
});
