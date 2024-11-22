import LootTable from '../../structures/LootTable';
import SimpleOpenable from '../../structures/SimpleOpenable';
import RareDropTable from '../subtables/RareDropTable';

const ClueTable = new LootTable()
	.add('Clue scroll (easy)', 1, 5)
	.add('Clue scroll (medium)', 1, 3)
	.add('Clue scroll (hard)', 1, 2);

const MysteryBoxTable = new LootTable()
	.oneIn(256, 'Stale baguette')

	.add(2528) // Genie Lamp
	.add('Cabbage')
	.add('Diamond')
	.add('Bucket')
	.add('Flyer')
	.add('Old boot')
	.add('Body rune')
	.add('Onion')
	.add('Mithril scimitar')
	.add('Casket')
	.add('Steel platebody')
	.add('Nature rune', 20)

	.add(ClueTable, 1, 2)
	.add(RareDropTable);

export default new SimpleOpenable({
	id: 6199,
	name: 'Mystery box',
	aliases: ['mystery box', 'mystery'],
	table: MysteryBoxTable
});
