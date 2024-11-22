import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';

export const WallBeastTable = new LootTable()
	/* Runes */
	.add('Air rune', 3, 8)
	.add('Cosmic rune', 2, 2)
	.add('Chaos rune', [3, 7], 2)

	/* Weapons and armour */
	.add('Bronze med helm', 1, 8)
	.add('Bronze full helm', 1, 8)
	.add('Iron med helm', 1, 8)
	.add('Steel med helm', 1, 8)
	.add('Steel full helm', 1, 8)
	.add('Black full helm', 1, 4)
	.add('Mithril med helm', 1, 4)
	.add('Mithril full helm', 1, 4)
	.add('Adamant med helm', 1, 4)
	.oneIn(512, 'Mystic hat (light)')

	/* Herbs */
	.add('Grimy guam leaf', 1, 8)

	/* Other */
	.add('Coins', 15, 24)
	.add('Tinderbox', 1, 8)
	.add('Lantern lens', 1, 8)
	.add('Unlit torch', 1, 8)
	.add('Eye of newt', 1, 4)
	.add('Bullseye lantern (unf)', 1, 1)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (medium)');

export default new SimpleMonster({
	id: 476,
	name: 'Wall beast',
	table: WallBeastTable,
	aliases: ['wall beast']
});
