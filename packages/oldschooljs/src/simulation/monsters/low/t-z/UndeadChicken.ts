import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const UndeadChickenTable: LootTable = new LootTable({ limit: 4 })
	.every('Bones')
	.every('Raw chicken')
	.add('Feather', 5, 2)
	.add('Feather', 15, 1);

export const UndeadChicken: SimpleMonster = new SimpleMonster({
	id: 2993,
	name: 'Undead chicken',
	table: UndeadChickenTable,
	aliases: ['undead chicken']
});
