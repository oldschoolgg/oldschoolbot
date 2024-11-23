import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export default new SimpleMonster({
	id: 13302,
	name: 'Wealthy Citizen',
	pickpocketTable: new LootTable({ limit: 85 })
		.add('Coins', 85, 79)
		.add('House keys', 1, 5)
		.add('Clue Scroll (Easy)', 1, 1),
	aliases: ['wealthy citizen', 'wealthy', 'citizen', 'varlamore citizen']
});
