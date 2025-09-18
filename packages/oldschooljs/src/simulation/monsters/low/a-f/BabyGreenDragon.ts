import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

const BabyGreenDragonTable = new LootTable().every('Babydragon bones');

export default new SimpleMonster({
	id: 5194,
	name: 'Baby green Dragon',
	table: BabyGreenDragonTable,
	aliases: ['baby green dragon', 'baby green drags']
});
