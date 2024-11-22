import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';
import UsefulHerbTable from '../../../subtables/UsefulHerbTable';

export const BasiliskKnightPreTable = new LootTable({ limit: 52 })
	/* Weapons and armour */
	.add('Rune axe', 1, 2)
	.add('Adamant platelegs', 1, 1)
	.add('Adamant kiteshield', 1, 1)
	.add('Rune battleaxe', 1, 1)
	.add('Rune dagger', 1, 1)
	.add('Rune scimitar', 1, 1)
	.add('Rune spear', 1, 1)
	.add('Rune med helm', 1, 1)

	/* Runes and ammunition */
	.add('Astral rune', [15, 35], 6)
	.add('Nature rune', [15, 30], 6)
	.add('Law rune', [20, 30], 6)
	.add('Death rune', [10, 25], 3)
	.add('Blood rune', [8, 20], 3)

	/* Herbs */
	.add(UsefulHerbTable, 1, 3)

	/* Other */
	.add('Coins', [500, 2498], 7)
	.add('Adamantite ore', [1, 2], 1)

	/* RDT */
	.add(GemTable, 1, 8);

const BasiliskKnightTable = new LootTable()
	.every('Big bones')
	.every(BasiliskKnightPreTable)

	/* Tertiary */
	.tertiary(192, 'Clue scroll (hard)')
	.tertiary(256, 'Mystic hat (light)')
	.tertiary(400, 'Long bone')
	.tertiary(1000, 'Basilisk head')
	.tertiary(5000, 'Basilisk jaw')
	.tertiary(5013, 'Curved bone');

const BasiliskKnightOnTaskTable = new LootTable()
	.every('Big bones')
	.every(BasiliskKnightPreTable)

	/* Tertiary */
	.tertiary(192, 'Clue scroll (hard)')
	.tertiary(256, 'Mystic hat (light)')
	.tertiary(400, 'Long bone')
	.tertiary(1000, 'Basilisk head')
	.tertiary(1000, 'Basilisk jaw')
	.tertiary(5013, 'Curved bone');

export default new SimpleMonster({
	id: 9293,
	name: 'Basilisk Knight',
	table: BasiliskKnightTable,
	onTaskTable: BasiliskKnightOnTaskTable,
	aliases: ['basilisk knight', 'bas knight']
});
