import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import RareDropTable, { GemTable } from '../../../subtables/RareDropTable';

export const MutatedBloodveldPreTable = new LootTable()
	/* Weapons and armour */
	.add('Mithril full helm', 1, 8)
	.add('Mithril battleaxe', 1, 6)
	.add('Black med helm', 1, 5)
	.add('Mithril axe', 1, 5)
	.add('Adamant knife', 2, 3)
	.add('Adamant chainbody', 1, 3)
	.add('Adamant scimitar', 1, 3)
	.add('Mithril platebody', 1, 2)
	.add('Rune med helm', 1, 2)
	.add('Black boots', 1, 1)
	.add('Adamant longsword', 1, 1)
	.add('Rune dagger', 1, 1)
	.add('Rune battleaxe', 1, 1)

	/* Runes and ammunition */
	.add('Blood rune', 30, 13)
	.add('Blood rune', 7, 10)
	.add('Fire rune', 75, 9)
	.add('Air rune', 105, 7)
	.add('Soul rune', 4, 7)

	/* Other */
	.add('Coins', 350, 10)
	.add('Gold ore', 1, 7)
	.add('Meat pizza', 1, 5)
	.add('Mithril bar', 1, 5)
	.add('Bow string', 1, 4)
	.add('Coins', 11, 3)
	.add('Ruby amulet', 1, 2)

	/* Rare and Gem drop table */
	.add(RareDropTable, 1, 3)
	.add(GemTable, 1, 2);

const MutatedBloodveldTable = new LootTable()
	.every('Vile ashes')
	.every(MutatedBloodveldPreTable)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)')
	.tertiary(20, 'Ensouled bloodveld head');

export default new SimpleMonster({
	id: 7276,
	name: 'Mutated Bloodveld',
	table: MutatedBloodveldTable,
	aliases: ['mutated bloodveld', 'thicc bois', 'thicc boi', 'mutated velds']
});
