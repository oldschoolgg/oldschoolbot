import { GemTable } from '@/simulation/subtables/RareDropTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const SuqahTable = new LootTable({ limit: 129 })
	.every('Big bones')
	.every('Suqah hide')

	/* Other */
	.add('Suqah tooth', 1, 69)
	.add('Grimy guam leaf', 1, 30)
	.add('Grimy marrentill', 1, 25)

	/* RDT */
	.add(GemTable, 1, 5)

	/* Tertiary */
	.tertiary(129, 'Clue scroll (hard)')
	.tertiary(400, 'Long bone')
	.tertiary(5013, 'Curved bone');

export default new SimpleMonster({
	id: 787,
	name: 'Suqah',
	table: SuqahTable,
	aliases: ['suqah']
});
