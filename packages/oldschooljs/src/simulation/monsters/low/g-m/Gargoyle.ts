import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

export const GargoylePreTable = new LootTable()
	.oneIn(256, 'Granite maul')
	.oneIn(512, 'Mystic robe top (dark)')

	/* Weapons and armor */
	.add('Adamant platelegs', 1, 4)
	.add('Rune full helm', 1, 3)
	.add('Rune 2h sword', 1, 2)
	.add('Adamant boots', 1, 1)
	.add('Rune battleaxe', 1, 1)
	.add('Rune platelegs', 1, 1)

	/* Runes and ammunition */
	.add('Fire rune', 75, 10)
	.add('Chaos rune', 30, 8)
	.add('Fire rune', 150, 6)
	.add('Death rune', 15, 5)

	/* Materials */
	.add('Gold ore', [10, 20], 10)
	.add('Pure essence', 150, 6)
	.add('Steel bar', 15, 6)
	.add('Gold bar', [10, 15], 3)
	.add('Mithril bar', 15, 2)
	.add('Runite ore', 1, 2)

	/* Coins */
	.add('Coins', [400, 800], 28)
	.add('Coins', [500, 1000], 20)
	.add('Coins', 10_000, 5)

	/* RDT */
	.add(GemTable, 1, 5);

const GargoyleTable = new LootTable()
	.every(GargoylePreTable)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)');

const GargoyleOnTaskTable = new LootTable()
	.every(GargoyleTable)

	/* Brittle key can only drop on task */
	.tertiary(150, 'Brittle key');

export default new SimpleMonster({
	id: 412,
	name: 'Gargoyle',
	table: GargoyleTable,
	onTaskTable: GargoyleOnTaskTable,
	aliases: ['gargoyle', 'garg', 'gargs']
});
