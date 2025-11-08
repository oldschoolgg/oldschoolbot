import { EItem } from '@/EItem.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleOpenable } from '@/structures/SimpleOpenable.js';

const NestBoxEmptyTable = new LootTable().every(EItem.EMPTY_BIRD_NEST);

export default new SimpleOpenable({
	id: 12_792,
	name: 'Nest box (empty)',
	aliases: ['nest box (empty)', 'empty nest box', 'nest box empty'],
	table: NestBoxEmptyTable
});
