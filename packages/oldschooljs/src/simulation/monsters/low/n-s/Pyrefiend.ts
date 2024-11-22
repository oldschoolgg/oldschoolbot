import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

export const PyrefiendPreTable = new LootTable()
	/* Weapons and armour */
	.add('Steel axe', 1, 4)
	.add('Steel full helm', 1, 4)
	.add('Staff of fire', 1, 3)
	.add('Mithril chainbody', 1, 2)
	.add('Steel boots', 1, 1)
	.add('Adamant med helm', 1, 1)

	/* Runes */
	.add('Fire rune', 30, 21)
	.add('Fire rune', 60, 8)
	.add('Chaos rune', 12, 5)
	.add('Death rune', 3, 3)

	/* Coins */
	.add('Coins', 40, 24)
	.add('Coins', 120, 20)
	.add('Coins', 200, 10)
	.add('Coins', 10, 7)
	.add('Coins', 450, 2)

	/* Other */
	.add('Gold ore', 1, 8)
	.add('Jug of wine', 1, 2)

	/* Gem drop table */
	.add(GemTable, 1, 3);

const PyrefiendTable = new LootTable()
	.every('Fiendish ashes')
	.every(PyrefiendPreTable)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (medium)');

export default new SimpleMonster({
	id: 433,
	name: 'Pyrefiend',
	table: PyrefiendTable,
	aliases: ['pyrefiend']
});
