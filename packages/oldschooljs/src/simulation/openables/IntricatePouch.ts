import LootTable from '../../structures/LootTable';
import SimpleOpenable from '../../structures/SimpleOpenable';

const PreRoll = new LootTable()
	.oneIn(15, 'Lamp')
	.oneIn(40, 'Tarnished locket')
	.oneIn(60, 'Lost bag')
	.oneIn(200, 'Blood essence');

const IntricatePouchTable = new LootTable()
	.every(PreRoll)

	/* Main drops */
	.add('Astral rune', [150, 200], 5)
	.add('Blood rune', [150, 200], 5)
	.add('Chaos rune', [200, 300], 5)
	.add('Cosmic rune', [200, 300], 5)
	.add('Death rune', [150, 200], 5)
	.add('Law rune', [200, 250], 5)
	.add('Nature rune', [200, 300], 5)
	.add('Soul rune', [150, 200], 5)
	.add('Shield left half', 1, 1)
	.add('Dragon spear', 1, 1)
	.add('Crystal key', 1, 1)
	.add('Dragon med helm', 1, 1)
	.add('Pure essence', [500, 1000], 1)

	/* Tertiary */
	.tertiary(10, 'Clue scroll (hard)');

export default new SimpleOpenable({
	id: 26_908,
	name: 'Intricate pouch',
	aliases: ['intricate pouch', 'intri pouch', 'int pouch'],
	table: IntricatePouchTable
});
