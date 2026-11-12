import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const DarkWizardTable: LootTable = new LootTable({ limit: 128 })
	.every('Bones')
	.add('Black robe', 1, 3)
	.add('Wizard hat', 1, 6)
	.add('Black skirt', 1, 1);

export const DarkWizard: SimpleMonster = new SimpleMonster({
	id: 512,
	name: 'Dark wizard',
	table: DarkWizardTable,
	aliases: ['dark wizard', 'dark wizards']
});
