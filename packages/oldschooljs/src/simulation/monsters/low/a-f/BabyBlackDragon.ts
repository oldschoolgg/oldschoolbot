import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const BabyBlackDragon: SimpleMonster = new SimpleMonster({
	id: 1871,
	name: 'Baby black Dragon',
	table: new LootTable().every('Babydragon bones'),
	aliases: ['baby black dragon', 'baby black drags']
});
