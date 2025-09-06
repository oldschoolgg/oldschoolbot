import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import { GemTable } from '../../subtables';

const SupplyTable = new LootTable()
	.add('Rune mace', 1, 2)
	.add('Rune pickaxe', 1, 1)
	.add('Rune platebody', 1, 1)
	.add('Rune platelegs', 1, 1)

	.add('Water rune', [200, 400], 5)
	.add('Chaos rune', [30, 60], 4)
	.add('Death rune', [20, 40], 4)
	.add('Blood rune', [15, 30], 4)
	.add('Soul rune', [15, 30], 4)
	.add('Nature rune', [30, 60], 3)

	.add('Coal', [20, 30], 5)
	.add('Gold ore', [20, 30], 5)
	.add('Adamantite ore', [5, 10], 4)
	.add('Prayer potion(3)', 1, 2)
	.add('Runite ore', 1, 2)
	.add('Blessed bone shards', [60, 100], 2)
	.add('Water orb', [10, 20], 2)
	.add('Water talisman', 1, 2)
	.add(GemTable, 1, 2);

const TearTable = new LootTable().add('Frozen tear', [2, 4]).add('Frozen tear', [5, 10]).add('Frozen tear', [10, 20]);

const AmoxliatlTable = new LootTable()
	.tertiary(3000, 'Moxi')
	.tertiary(125, 'Tooth half of key (moon key)')
	.tertiary(200, 'Clue scroll (elite)')
	.tertiary(100, 'Glacial temotli')
	.tertiary(25, 'Pendant of ates (inert)')
	.every(SupplyTable, 2)
	.every(TearTable);

export const Amoxliatl = new SimpleMonster({
	id: 13685,
	name: 'Amoxliatl',
	table: AmoxliatlTable,
	aliases: ['amoxliatl']
});
