import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const BabyBlueDragonTable: LootTable = new LootTable()
	.every('Babydragon bones')

	/* Tertiary */
	.tertiary(100, 'Scaly blue dragonhide');

export const BabyBlueDragon: SimpleMonster = new SimpleMonster({
	id: 241,
	name: 'Baby blue Dragon',
	table: BabyBlueDragonTable,
	aliases: ['baby blue dragon', 'baby blue drags']
});
