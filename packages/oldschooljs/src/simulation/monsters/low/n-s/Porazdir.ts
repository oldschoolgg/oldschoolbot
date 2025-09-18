import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

export const PorazdirTable = new LootTable().every("Demon's heart");

export default new SimpleMonster({
	id: 7860,
	name: 'Porazdir',
	table: PorazdirTable,
	aliases: ['porazdir']
});
