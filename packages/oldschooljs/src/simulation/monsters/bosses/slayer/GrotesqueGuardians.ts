import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { itemTupleToTable } from '../../../../util';

const NormalUniqueTable = new LootTable()
	/* Unique */
	.oneIn(250, 'Granite maul')
	.oneIn(500, 'Granite gloves')
	.oneIn(500, 'Granite ring')
	.oneIn(750, 'Granite hammer')
	.oneIn(1000, 'Black tourmaline core')

	/* Weapons and armour */
	.add('Rune pickaxe', 1, 6)
	.add('Rune full helm', 1, 5)
	.add('Rune platelegs', 1, 5)
	.add('Rune 2h sword', 1, 4)
	.add('Rune battleaxe', 1, 3)
	.add('Dragon longsword', 1, 1)
	.add('Adamant boots', 1, 1)
	.add('Dragon med helm', 1, 1)

	/* Food and potions */
	.add('Mushroom potato', [4, 6], 10)
	.add('Saradomin brew(4)', 2, 8)
	.add(
		itemTupleToTable([
			['Magic potion(2)', 1],
			['Ranging potion(2)', 1],
			['Super combat potion(2)', 1]
		]),
		1,
		6
	)
	.add('Prayer potion(4)', [1, 2], 4)

	/* Resources */
	.add('Gold ore', [40, 75], 7)
	.add('Adamantite bar', [25, 40], 6)
	.add('Coal', [180, 250], 6)
	.add('Gold bar', [37, 50], 6)
	.add('Mithril bar', [35, 45], 6)
	.add('Runite ore', [3, 6], 4)
	.add('Runite bar', [3, 5], 3)

	/* Other */
	.add('Coins', [10_000, 20_000], 10)
	.add('Chaos rune', [100, 150], 8)
	.add('Coins', 25_000, 5)
	.add('Crystal key', 1, 5)
	.add('Chaos rune', [60, 100], 5)
	.add('Dragon dart tip', [15, 25], 4)
	.add('Diamond bolt tips', [100, 150], 3)
	.add('Dragonstone bolt tips', [20, 40], 2)
	.add('Onyx bolt tips', [5, 10], 2)
	.add('Dragon arrowtips', [50, 150], 1);

const GrotesqueGuardiansTable = new LootTable()
	.every('Granite dust', [50, 100])
	.every(NormalUniqueTable, 2)

	/* Tertiary */
	.tertiary(230, 'Clue scroll (elite)')
	.tertiary(3000, 'Noon')
	.tertiary(5000, 'Jar of stone');

export default new SimpleMonster({
	id: 7851,
	name: 'Grotesque Guardians',
	table: GrotesqueGuardiansTable,
	aliases: ['grotesque guardians', 'ggs', 'dawn', 'dusk', 'gargoyle boss', 'rocky bois']
});
