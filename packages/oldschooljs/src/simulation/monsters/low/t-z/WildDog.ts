import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const WildDogTable: LootTable = new LootTable().every('Bones').tertiary(25, 'Ensouled dog head');

export const WildDog: SimpleMonster = new SimpleMonster({
	id: 112,
	name: 'Wild dog',
	table: WildDogTable,
	aliases: ['wild dog']
});
