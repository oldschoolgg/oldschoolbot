import LootTable from '@/structures/LootTable.js';
import { SimpleOpenable } from '@/structures/SimpleOpenable.js';

const ForgottenLockboxTable = new LootTable()
	.add('Dragon bolts (unf)', 125, 60)
	.add('Dragon dart', 125, 60)
	.add('Oathplate shards', 14, 60)
	.add('Dragon dart', 80, 50)
	.add('Oathplate shards', 11, 50)
	.add('Dragon platelegs', 1, 50)
	.add('Dragon plateskirt', 1, 50)
	.add('Coins', 233_333, 20)
	.add('Oathplate helm', 1, 1)
	.add('Oathplate chest', 1, 1)
	.add('Oathplate legs', 1, 1);

export default new SimpleOpenable({
	id: 30_763,
	name: 'Forgotten lockbox',
	aliases: ['forgotten lockbox', 'lockbox'],
	table: ForgottenLockboxTable
});
