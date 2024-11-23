import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

export const ChilledJellyPreTable = new LootTable()
	/* Weapons and armour */
	.add('Adamant battleaxe', 1, 11)
	.add('Black 2h sword', 1, 5)
	.add('Adamant axe', 1, 3)
	.add('Adamant 2h sword', 1, 2)
	.add('Mithril boots', 1, 2)
	.add('Rune kiteshield', 1, 2)
	.add('Rune full helm', 1, 1)

	/* Runes */
	.add('Chaos rune', 45, 5)
	.add('Death rune', 15, 3)

	/* Coins */
	.add('Coins', 44, 27)
	.add('Coins', 102, 27)
	.add('Coins', 220, 9)
	.add('Coins', 11, 6)
	.add('Coins', 460, 2)

	/* Other */
	.add('Lobster', 2, 16)
	.add('Gold bar', 1, 2)
	.add('Thread', 10, 1)

	/* Gem drop table */
	.add(GemTable, 1, 4);

const ChilledJellyTable = new LootTable()
	.every(ChilledJellyPreTable)

	/* Tertiary */
	.tertiary(64, 'Clue scroll (hard)')
	.tertiary(100, 'Frozen tear', [8, 12]);

export default new SimpleMonster({
	id: 13799,
	name: 'Chilled Jelly',
	table: ChilledJellyTable,
	aliases: ['chilled jelly', 'chill jelly', 'cold jello']
});
