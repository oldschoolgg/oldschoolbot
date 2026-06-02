import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const PorazdirTable: LootTable = new LootTable().every("Demon's heart");

export const Porazdir: SimpleMonster = new SimpleMonster({
	id: 7860,
	name: 'Porazdir',
	table: PorazdirTable,
	aliases: ['porazdir']
});
