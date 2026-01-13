import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const MonkeyZombieTable: LootTable = new LootTable().every('Monkey bones');

export const MonkeyZombie: SimpleMonster = new SimpleMonster({
	id: 5281,
	name: 'Monkey Zombie',
	table: MonkeyZombieTable,
	aliases: ['monkey zombie']
});
