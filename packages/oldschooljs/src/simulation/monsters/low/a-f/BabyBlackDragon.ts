import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

const BabyBlackDragon = new LootTable().every('Babydragon bones');

export default new SimpleMonster({
	id: 1871,
	name: 'Baby black Dragon',
	table: BabyBlackDragon,
	aliases: ['baby black dragon', 'baby black drags']
});
