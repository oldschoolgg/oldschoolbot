import { GemTable } from '@/simulation/subtables/RareDropTable.js';
import LootTable from '@/structures/LootTable.js';
import {SimpleMonster} from '@/structures/Monster.js';

const SulphurNaguaTable = new LootTable()
	.tertiary(450, 'Sulphur blades')
	.tertiary(256, 'Clue scroll (hard)')

	.add('Fire rune', [10, 40], 26)
	.add('Fire rune', [40, 60], 14)
	.add('Chaos rune', [40, 60], 11)
	.add('Nature rune', [5, 10], 4)
	.add('Death rune', [40, 60], 2)

	.add('Iron ore', [5, 10], 27)
	.add('Coal', [5, 10], 13)
	.add('Silver ore', [5, 10], 12)
	.add('Tin ore', [10, 15], 5)
	.add('Sulphurous essence', [6, 10], 4)
	.add('Copper ore', [10, 15], 3)
	.add('Mithril ore', [5, 10], 1)

	.add(GemTable, 1, 4);

export const SulphurNagua = new SimpleMonster({
	id: 13_033,
	name: 'Sulphur Nagua',
	table: SulphurNaguaTable,
	aliases: ['sulphur nagua']
});
