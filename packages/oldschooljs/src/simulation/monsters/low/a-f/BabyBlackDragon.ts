import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const BabyBlackDragon = new LootTable().every('Babydragon bones');

export default new SimpleMonster({
	id: 1871,
	name: 'Baby black Dragon',
	table: BabyBlackDragon,
	aliases: ['baby black dragon', 'baby black drags']
});
