import { EMonster } from '@/EMonster.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const DemonicBrutusTable = new LootTable().every('Brutus slippers').tertiary(400, 'Beef');

export const DemonicBrutus: SimpleMonster = new SimpleMonster({
	id: EMonster.DEMONIC_BRUTUS,
	name: 'Demonic Brutus',
	table: DemonicBrutusTable,
	aliases: ['demonic brutus']
});
