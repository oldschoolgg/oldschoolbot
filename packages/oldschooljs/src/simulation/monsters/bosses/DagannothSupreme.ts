import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import RareDropTable, { GemTable } from '../../subtables/RareDropTable';
import RareSeedTable from '../../subtables/RareSeedTable';
import TalismanTable from '../../subtables/TalismanTable';

const DagannothSupremeTable = new LootTable()
	.every('Dagannoth bones')
	.every('Dagannoth hide')
	.tertiary(20, 'Ensouled dagannoth head')
	.tertiary(42, 'Clue scroll (hard)')
	.tertiary(750, 'Clue scroll (elite)')
	.tertiary(5000, 'Pet dagannoth supreme')

	/* Weapons and armour */
	.add('Mithril knife', [25, 50], 10)
	.add("Red d'hide vambraces", 1, 7)
	.add('Rune thrownaxe', [5, 10], 5)
	.add('Adamant dart', [10, 25], 5)
	.add('Iron knife', [200, 500], 5)
	.add('Steel knife', [50, 150], 5)
	.add('Fremennik blade')
	.add('Fremennik shield')
	.add('Fremennik helm')
	.add('Seercull')
	.add('Dragon axe')
	.add('Archer helm')
	.add('Spined body')
	.add('Spined chaps')
	.add('Archers ring')

	/* ammunition */
	.add('Steel arrow', [50, 250], 5)
	.add('Runite bolts', [2, 12], 5)
	.add('Iron arrow', [200, 700], 4)

	/* Other */
	.add('Coins', [500, 1109], 10)
	.add('Oyster pearls', 1, 6)
	.add('Opal bolt tips', [10, 30], 5)
	.add('Shark', 5, 5)
	.add('Yew logs', [50, 150], 5)
	.add('Grimy ranarr weed', 1, 5)
	.add('Maple logs', [15, 65], 3)
	.add('Runite limbs', 1, 2)
	.add('Feather', [250, 500], 1)
	.add(RareDropTable, 1, 8)
	.add(GemTable, 1, 10)
	.add(RareSeedTable, 1, 7)
	.add(TalismanTable);

export default new SimpleMonster({
	id: 2265,
	name: 'Dagannoth Supreme',
	table: DagannothSupremeTable,
	aliases: ['supreme', 'dagannoth supreme']
});
