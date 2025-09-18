import { EMPTY_BIRD_NEST_ID } from '@/constants.js';
import LootTable from '@/structures/LootTable.js';
import {SimpleOpenable} from '@/structures/SimpleOpenable.js';

const NestBoxEmptyTable = new LootTable().every(EMPTY_BIRD_NEST_ID);

export default new SimpleOpenable({
	id: 12_792,
	name: 'Nest box (empty)',
	aliases: ['nest box (empty)', 'empty nest box', 'nest box empty'],
	table: NestBoxEmptyTable
});
