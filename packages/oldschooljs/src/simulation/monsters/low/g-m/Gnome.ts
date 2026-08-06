import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const GnomeTable = new LootTable({ limit: 128 })
	.add('Arrow shaft', [2, 4], 56)
	.add('Coins', 300, 30)
	.add('Swamp toad', 1, 24)
	.add('Gold ore', 1, 8)
	.add('Earth rune', 1, 5)
	.add('King worm', 1, 3)
	.add('Fire orb', 1, 2)
	.tertiary(150, 'Clue scroll (medium)')
	.tertiary(108_718, 'Rocky');

export const Gnome: SimpleMonster = new SimpleMonster({
	id: 5969,
	name: 'Gnome',
	pickpocketTable: GnomeTable,
	aliases: ['gnome']
});
