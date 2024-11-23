import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const RogueTable = new LootTable()
	// Weaponry
	.add('Iron dagger(p)', 1, 1 / 128)

	// Other
	.add('Coins', [25, 40], 1 / 1.185)
	.add('Air rune', 8, 1 / 16)
	.add('Jug of wine', 1, 1 / 21.33)
	.add('Lockpick', 1, 1 / 25.6)
	.tertiary(257_211, 'Rocky');

export default new SimpleMonster({
	id: 526,
	name: 'Rogue',
	pickpocketTable: RogueTable,
	aliases: ['rogue']
});
