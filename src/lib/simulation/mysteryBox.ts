import LootTable from 'oldschooljs/dist/structures/LootTable';
import RareDropTable from 'oldschooljs/dist/simulation/subtables/RareDropTable';

const ClueTable = new LootTable()
	.addItem('Clue scroll (easy)', 1, 9)
	.addItem('Clue scroll (medium)', 1, 4)
	.addItem('Clue scroll (hard)', 1, 4);

const MysteryBoxTable = new LootTable()
	.add('Old boot')
	.add('Flier')
	.add('Body rune')
	.add('Bucket')
	.add('Cabbage')
	.add('Onion')
	.add('Coins', [500, 3000])
	.add('Mithril scimitar')
	.add('Casket')
	.add('Steel platebody')
	.add('Diamond')
	.add('Nature rune', 20)
	.add(ClueTable)
	.add(RareDropTable)
	.oneIn(150, 'Rune sq shield')
	.oneIn(256, 'Stale baguette');

export default MysteryBoxTable;
