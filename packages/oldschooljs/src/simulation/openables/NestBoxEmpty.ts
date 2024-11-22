import { EMPTY_BIRD_NEST_ID } from '../../constants';
import LootTable from '../../structures/LootTable';
import SimpleOpenable from '../../structures/SimpleOpenable';

const NestBoxEmptyTable = new LootTable().every(EMPTY_BIRD_NEST_ID);

export default new SimpleOpenable({
	id: 12_792,
	name: 'Nest box (empty)',
	aliases: ['nest box (empty)', 'empty nest box', 'nest box empty'],
	table: NestBoxEmptyTable
});
