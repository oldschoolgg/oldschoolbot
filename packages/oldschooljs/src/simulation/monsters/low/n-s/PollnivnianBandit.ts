import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

export default new SimpleMonster({
	id: 736,
	name: 'Pollnivnian bandit',
	pickpocketTable: new LootTable().add('Coins', 50),
	aliases: ['pollnivnian bandit']
});
