import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import RareDropTable, { GemTable } from '../../subtables/RareDropTable';
import RareSeedTable from '../../subtables/RareSeedTable';
import TalismanTable from '../../subtables/TalismanTable';

const DagannothPrimeTable = new LootTable()
	.every('Dagannoth bones')
	.every('Dagannoth hide')
	.tertiary(20, 'Ensouled dagannoth head')
	.tertiary(42, 'Clue scroll (hard)')
	.tertiary(750, 'Clue scroll (elite)')
	.tertiary(5000, 'Pet dagannoth prime')

	/* Weapons and armour */
	.add('Earth battlestaff', 1, 10)
	.add('Water battlestaff', 1, 5)
	.add('Air battlestaff', 1, 4)
	.add('Battlestaff', [1, 10], 1)
	.add('Fremennik blade')
	.add('Fremennik shield')
	.add('Fremennik helm')
	.add('Mud battlestaff')
	.add('Dragon axe')
	.add('Farseer helm')
	.add('Skeletal top')
	.add('Skeletal bottoms')
	.add('Seers ring')

	/* Runes */
	.add('Air rune', [100, 200], 6)
	.add('Earth rune', [50, 100], 5)
	.add('Blood rune', [25, 75], 2)
	.add('Law rune', [10, 75], 2)
	.add('Nature rune', [25, 50], 2)
	.add('Mud rune', [25, 75], 2)
	.add('Death rune', [25, 85], 2)

	/* Talismans */
	.add('Earth talisman', [25, 75], 10)
	.add('Air talisman', [25, 75], 7)
	.add('Water talisman', [1, 76], 7)
	.add(TalismanTable)

	/* Other */
	.add('Shark', 5, 10)
	.add('Oyster pearls', 1, 5)
	.add('Pure essence', 150, 5)
	.add('Grimy ranarr weed', 1, 5)
	.add('Coins', [500, 1109], 3)
	.add(RareDropTable, 1, 8)
	.add(GemTable, 1, 10)
	.add(RareSeedTable, 1, 7);

export default new SimpleMonster({
	id: 2266,
	name: 'Dagannoth Prime',
	table: DagannothPrimeTable,
	aliases: ['prime', 'dagannoth prime']
});
