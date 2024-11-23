import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const MonkeyZombieTable = new LootTable().every('Monkey bones');

export default new SimpleMonster({
	id: 5281,
	name: 'Monkey Zombie',
	table: MonkeyZombieTable,
	aliases: ['monkey zombie']
});
