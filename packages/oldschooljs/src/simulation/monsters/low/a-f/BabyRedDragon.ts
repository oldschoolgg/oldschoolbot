import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const BabyRedDragonTable = new LootTable().every('Babydragon bones');

export default new SimpleMonster({
	id: 137,
	name: 'Baby red Dragon',
	table: BabyRedDragonTable,
	aliases: ['baby red dragon', 'baby red drags']
});
