import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const WizardTable: LootTable = new LootTable({ limit: 128 })
	.every('Bones')
	.add('Blue wizard robe', 1, 7)
	.add('Blue wizard hat', 1, 3)
	.add('Blue skirt', 1, 1);

export const Wizard: SimpleMonster = new SimpleMonster({
	id: 330,
	name: 'Wizard',
	table: WizardTable,
	aliases: ['wizard']
});
