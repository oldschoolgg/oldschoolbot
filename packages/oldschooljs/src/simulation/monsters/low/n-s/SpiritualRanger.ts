import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

const SpiritualRangerTable = new LootTable({ limit: 128 })

	/* Weapons */
	.add('Oak shortbow', 1, 5)
	.add('Maple longbow', 1, 4)
	.add('Steel crossbow', 1, 3)
	.add('Magic shortbow', [1, 2], 1)

	/* Runes and ammunition */
	.add('Iron arrow', 12, 15)
	.add('Bronze arrow', 16, 13)
	.add('Mithril arrow(p+)', 1, 11)
	.add('Steel arrow', 12, 4)
	.add('Body rune', 12, 4)
	.add('Adamant arrow(p++)', 3, 3)
	.add('Rune arrow', 5, 2)
	.add('Adamant fire arrow', 4, 2)
	.add('Bronze arrow(p+)', 1, 1)
	.add('Adamant arrow', 12, 1)

	/* Other */
	.add('Bow string', 7, 18)
	.add('Iron arrowtips', 5, 11)
	.add('Headless arrow', 12, 10)
	.add('Adamant arrowtips', 13, 9)
	.add('Oak longbow (u)', 12, 9)
	.add('Broken arrow', 1, 1)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)');

export default new SimpleMonster({
	id: 2211,
	name: 'Spiritual Ranger',
	table: SpiritualRangerTable,
	aliases: ['spiritual ranger', 'spiritual creatures']
});
