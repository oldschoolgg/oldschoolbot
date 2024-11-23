import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';
import RareSeedTable from '../../../subtables/RareSeedTable';

const DagannothTable = new LootTable()
	.every('Bones')

	/* Weapons*/
	.add('Iron spear', 1, 6)
	.add('Bronze spear', 1, 5)
	.add('Mithril spear', 1, 1)

	/* Runes and ammunition */
	.add('Water rune', 15, 4)
	.add('Steel arrow', 15, 2)
	.add('Mithril javelin', 3, 1)

	/* Seeds */
	.add(RareSeedTable, 1, 18)

	/* Fishing */
	.add('Lobster pot', 1, 12)
	.add('Raw herring', 3, 4)
	.add('Raw sardine', 5, 4)
	.add('Harpoon', 1, 3)
	.add('Feather', 15, 2)
	.add('Fishing bait', 50, 2)
	.add('Raw lobster', 1, 2)
	.add('Raw tuna', 1, 2)
	.add('Seaweed', 10, 2)
	.add('Oyster pearls', 1, 1)
	.add('Oyster pearl', 2, 1)

	/* Coins */
	.add('Coins', 56, 29)
	.add('Coins', 25, 9)
	.add('Coins', 44, 8)
	.add('Coins', 41, 6)

	/* Other */
	.add('Opal bolt tips', 12, 2)
	.add('Casket', 1, 1)

	/* RDT */
	.add(GemTable, 1, 1)

	/* Tertiary */
	.tertiary(40, 'Ensouled dagannoth head')
	.tertiary(128, 'Clue scroll (medium)');

export default new SimpleMonster({
	id: 3185,
	name: 'Dagannoth',
	table: DagannothTable,
	aliases: ['dagannoth']
});
