import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export default new SimpleMonster({
	id: 3260,
	name: 'Warrior woman',
	pickpocketTable: new LootTable().add('Coins', 18).tertiary(257_211, 'Rocky'),
	aliases: ['warrior woman']
});
