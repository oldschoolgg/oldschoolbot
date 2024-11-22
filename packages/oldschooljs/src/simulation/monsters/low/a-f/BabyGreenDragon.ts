import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const BabyGreenDragonTable = new LootTable().every('Babydragon bones');

export default new SimpleMonster({
	id: 5194,
	name: 'Baby green Dragon',
	table: BabyGreenDragonTable,
	aliases: ['baby green dragon', 'baby green drags']
});
