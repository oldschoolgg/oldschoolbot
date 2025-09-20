import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const WildDogTable = new LootTable().every('Bones').tertiary(25, 'Ensouled dog head');

export default new SimpleMonster({
	id: 112,
	name: 'Wild dog',
	table: WildDogTable,
	aliases: ['wild dog']
});
