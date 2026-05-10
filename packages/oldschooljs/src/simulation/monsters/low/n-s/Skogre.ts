import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const SkogreTable: LootTable = new LootTable().every('Zogre bones').every('Ogre coffin key');

export const Skogre: SimpleMonster = new SimpleMonster({
	id: 878,
	name: 'Skogre',
	table: SkogreTable,
	aliases: ['skogre']
});
