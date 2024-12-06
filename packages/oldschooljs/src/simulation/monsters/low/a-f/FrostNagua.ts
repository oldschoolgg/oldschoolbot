import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables';

const FrostNaguaTable = new LootTable()
	.tertiary(7000, 'Tooth half of key (moon key)')
	.tertiary(500, 'Glacial temotli')
	.tertiary(100, 'Pendant of ates (inert)')
	.tertiary(10, 'Frozen tear', [5, 10])
	.tertiary(256, 'Clue scroll (hard)')

	.add('Water rune', [10, 30], 3)
	.add('Water rune', [30, 100], 3)
	.add('Chaos rune', [20, 40], 3)
	.add('Death rune', [10, 30], 2)
	.add('Nature rune', [10, 20], 2)

	.add('Coal', [10, 15], 3)
	.add('Gold ore', [10, 20], 3)
	.add('Soft clay', [10, 20], 3)
	.add('Mithril ore', [5, 10], 2)

	.add('Water orb', [2, 6], 3)
	.add('Prayer potion(1)', 1, 2)
	.add('Rune mace', 1, 1)
	.add('Water talisman', 1, 1)
	.add('Blessed bone shards', [30, 50], 1)
	.add('Jug of water', [10, 30], 1)
	.add(GemTable);

export const FrostNagua = new SimpleMonster({
	id: 13_728,
	name: 'Frost Nagua',
	table: FrostNaguaTable,
	aliases: ['frost nagua']
});
