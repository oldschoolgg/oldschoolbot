import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const GuardDogTable: LootTable = new LootTable().every('Bones').tertiary(25, 'Ensouled dog head', 1);

export const GuardDog: SimpleMonster = new SimpleMonster({
	id: 114,
	name: 'Guard dog',
	table: GuardDogTable,
	aliases: ['guard dog', 'dog', 'dogs']
});
