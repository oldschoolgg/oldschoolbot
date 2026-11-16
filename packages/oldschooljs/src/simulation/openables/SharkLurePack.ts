import LootTable from '@/structures/LootTable.js';
import { SimpleOpenable } from '@/structures/SimpleOpenable.js';

const SharkLurePackTable: LootTable = new LootTable().every('Shark Lure', 100);

export const SharkLurePack: SimpleOpenable = new SimpleOpenable({
	id: 34_065,
	name: 'Shark Lure Pack',
	aliases: ['shark lure pack', 'shark lure'],
	table: SharkLurePackTable
});
