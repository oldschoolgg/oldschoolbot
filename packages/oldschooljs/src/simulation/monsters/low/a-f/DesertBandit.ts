import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const DesertBanditTable = new LootTable()
	.add('Coins', 30, 70)
	.add('Antipoison(1)', 1, 15)
	.add('Lockpick', 1, 15)
	.tertiary(257_211, 'Rocky');

export default new SimpleMonster({
	id: 690,
	name: 'Desert Bandit',
	pickpocketTable: DesertBanditTable,
	aliases: ['desert bandit']
});
