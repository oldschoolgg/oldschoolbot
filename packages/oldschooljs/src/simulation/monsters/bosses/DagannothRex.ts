import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import RareDropTable, { GemTable } from '../../subtables/RareDropTable';
import TalismanTable from '../../subtables/TalismanTable';

const DagannothRexTable = new LootTable()
	.every('Dagannoth bones')
	.every('Dagannoth hide')
	.tertiary(20, 'Ensouled dagannoth head')
	.tertiary(42, 'Clue scroll (hard)')
	.tertiary(750, 'Clue scroll (elite)')
	.tertiary(5000, 'Pet dagannoth rex')

	/* Weapons and armour */
	.add('Steel kiteshield', 1, 17)
	.add('Mithril warhammer', 1, 11)
	.add('Adamant axe', 1, 7)
	.add('Steel platebody', 1, 4)
	.add('Mithril pickaxe', 1, 3)
	.add('Adamant platebody', 1, 2)
	.add('Fremennik blade', 1, 2)
	.add('Rune axe')
	.add('Fremennik shield')
	.add('Fremennik helm')
	.add('Mithril 2h sword')
	.add('Dragon axe')
	.add('Ring of life')
	.add('Rock-shell plate')
	.add('Rock-shell legs')
	.add('Berserker ring')
	.add('Warrior ring')

	/* Potions */
	.add('Antifire potion(2)')
	.add('Prayer potion(2)')
	.add('Restore potion(2)')
	.add('Super attack(2)')
	.add('Super strength(2)')
	.add('Super defence(2)')
	.add('Zamorak brew(2)')

	/* Ores and bars */
	.add('Mithril ore', 25, 10)
	.add('Adamantite bar', 1, 3)
	.add('Coal', 100, 2)
	.add('Iron ore', 150, 1)
	.add('Steel bar', [15, 30], 1)

	/* Other */
	.add('Coins', [500, 1109], 10)
	.add('Grimy ranarr weed', 1, 7)
	.add('Bass', 5, 7)
	.add('Swordfish', 5, 4)
	.add('Shark', 5, 1)
	.add(RareDropTable, 1, 8)
	.add(GemTable, 1, 10)
	.add(TalismanTable);

export default new SimpleMonster({
	id: 2267,
	name: 'Dagannoth Rex',
	table: DagannothRexTable,
	aliases: ['rex', 'dagannoth rex']
});
