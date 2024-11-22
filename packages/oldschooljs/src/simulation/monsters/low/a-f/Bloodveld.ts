import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { itemTupleToTable } from '../../../../util';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

export const BloodveldPreTable = new LootTable()
	/* Weapons and armour */
	.add('Steel axe', 1, 4)
	.add('Steel full helm', 1, 4)
	.add('Steel scimitar', 1, 2)
	.add('Black boots', 1, 1)
	.add('Mithril sq shield', 1, 1)
	.add('Mithril chainbody', 1, 1)
	.add('Rune med helm', 1, 1)

	/* Runes and ammunition */
	.add('Fire rune', 60, 8)
	.add('Blood rune', 10, 5)
	.add('Blood rune', 3, 3)
	.add('Blood rune', 30, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 1)

	/* Coins */
	.add('Coins', 120, 30)
	.add('Coins', 40, 29)
	.add('Coins', 200, 10)
	.add('Coins', 10, 7)
	.add('Coins', 450, 1)

	/* Other */
	.add(
		itemTupleToTable([
			['Big bones', 1],
			['Bones', 1]
		]),
		1,
		7
	)
	.add(
		itemTupleToTable([
			['Big bones', 3],
			['Bones', 1]
		]),
		1,
		3
	)
	.add('Meat pizza', 1, 3)
	.add('Gold ore', 1, 2)

	/* RDT */
	.add(GemTable, 1, 4);

const BloodveldTable = new LootTable()
	.every('Vile ashes')
	.every(BloodveldPreTable)

	/* Tertiary */
	.tertiary(256, 'Clue scroll (hard)')
	.tertiary(35, 'Ensouled bloodveld head');

export default new SimpleMonster({
	id: 484,
	name: 'Bloodveld',
	table: BloodveldTable,
	aliases: ['bloodveld', 'veld', 'velds', 'thicc boi jr']
});
