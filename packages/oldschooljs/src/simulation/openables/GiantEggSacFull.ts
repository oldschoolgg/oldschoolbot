import LootTable from '@/structures/LootTable.js';
import { SimpleOpenable } from '@/structures/SimpleOpenable.js';

const GiantEggSacFullTable: LootTable = new LootTable().every("Red spiders' eggs", 100);

export const GiantEggSacFull: SimpleOpenable = new SimpleOpenable({
	id: 23_517,
	name: 'Giant egg sac(full)',
	aliases: ['giant egg sac(full)', 'giant egg sac full'],
	table: GiantEggSacFullTable
});
