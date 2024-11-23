import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { itemTupleToTable } from '../../../util';
import { UncommonSeedDropTable } from '../../subtables';
import HerbDropTable from '../../subtables/HerbDropTable';

const ChaosTable = new LootTable().add('Chaos rune', 100, 1).add('Chaos rune', 200, 1);

const BryophytaTable = new LootTable()
	.every('Big bones')
	.every('Clue scroll (beginner)')

	/* Weapons and armour */
	.add('Rune longsword', 1, 6)
	.add('Rune med helm', 2, 6)
	.add('Rune chainbody', 1, 6)
	.add('Rune plateskirt', 1, 6)
	.add('Rune platelegs', 1, 6)
	.add('Rune sq shield', 1, 6)
	.add('Rune sword', 2, 5)
	.add('Adamant platebody', 5, 3)
	.add('Battlestaff', 3, 3)
	.add('Adamant kiteshield', 3, 1)

	/* Runes and ammunition */
	.add('Nature rune', 100, 8)
	.add('Cosmic rune', 100, 6)
	.add('Law rune', 100, 6)
	.add(ChaosTable, 1, 6)
	.add('Death rune', 100, 5)
	.add('Blood rune', 100, 1)
	.add('Adamant arrow', 100, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 5)

	/* Seeds */
	.add(UncommonSeedDropTable, 1, 6)

	/* Materials */
	.add('Runite bar', 2, 6)
	.add(
		itemTupleToTable([
			['Uncut ruby', 5],
			['Uncut diamond', 5]
		]),
		1,
		4
	)
	.add('Steel bar', 25, 3)

	/* Other */
	.add('Coins', 10_000, 5)
	.add('Coins', 8000, 2)
	.add("Bryophyta's essence", 1, 1)

	/* Tertiary */
	.tertiary(16, 'Mossy key', 1, { freeze: true })
	.tertiary(400, 'Long bone')
	.tertiary(5000, 'Giant champion scroll')
	.tertiary(5013, 'Curved bone');

export default new SimpleMonster({
	id: 8195,
	name: 'Bryophyta',
	table: BryophytaTable,
	aliases: ['bryophyta']
});
