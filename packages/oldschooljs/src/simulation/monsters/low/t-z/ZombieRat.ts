import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const ZombieRatTable = new LootTable().every('Bones');

export default new SimpleMonster({
	id: 3969,
	name: 'Zombie rat',
	table: ZombieRatTable,
	aliases: ['zombie rat']
});
