import CommonSeedDropTable from '@/simulation/subtables/CommonSeedDropTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const LizardmanTable = new LootTable({ limit: 78 })
	.every('Bones')

	/* Seeds */
	.add(CommonSeedDropTable, 1, 15)

	/* Other */
	.add('Lizardman fang', 1, 14)
	.add('Xerician fabric', 1, 8)
	.oneIn(125, "Xeric's talisman (inert)");

export default new SimpleMonster({
	id: 6914,
	name: 'Lizardman',
	table: LizardmanTable,
	aliases: ['lizardman']
});
