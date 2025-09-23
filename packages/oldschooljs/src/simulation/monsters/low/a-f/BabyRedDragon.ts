import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const BabyRedDragonTable = new LootTable().every('Babydragon bones');

export default new SimpleMonster({
	id: 137,
	name: 'Baby red Dragon',
	table: BabyRedDragonTable,
	aliases: ['baby red dragon', 'baby red drags']
});
