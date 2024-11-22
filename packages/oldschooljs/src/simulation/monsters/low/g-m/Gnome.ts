import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const GnomeTable = new LootTable({ limit: 128 })
	.add('King worm', 1, 55)
	.add('Coins', [1, 300], 30)
	.add('Swamp toad', 1, 28)
	.add('Gold ore', 1, 8)
	.add('Earth rune', 1, 5)
	.add('Fire orb', 1, 2)
	.tertiary(108_718, 'Rocky');

export default new SimpleMonster({
	id: 5969,
	name: 'Gnome',
	pickpocketTable: GnomeTable,
	aliases: ['gnome']
});
