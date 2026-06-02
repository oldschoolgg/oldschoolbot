import LootTable from '@/structures/LootTable.js';
import { SimpleOpenable } from '@/structures/SimpleOpenable.js';

const SinisterChestTable: LootTable = new LootTable()
	.every('Grimy ranarr weed', 3)
	.every('Grimy harralander', 2)
	.every('Grimy irit leaf')
	.every('Grimy avantoe')
	.every('Grimy kwuarm')
	.every('Grimy torstol');

export const SinisterChest: SimpleOpenable = new SimpleOpenable({
	id: 993,
	name: 'Sinister chest',
	aliases: ['sinister chest', 'sinister'],
	table: SinisterChestTable
});
