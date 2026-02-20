import { GemTable, RareDropTable } from '@/simulation/subtables/RareDropTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const ElderCustodianStalkerPreTable: LootTable = new LootTable()
	/* Runes and ammunition*/
	.add('Cannonball', [20, 30], 15)
	.add('Air rune', 200, 12)
	.add('Fire rune', 150, 12)
	.add('Rune arrow', [20, 35], 12)
	.add('Death rune', [40, 50], 6)

	/* Resources */
	.add('Shark', [2, 3], 12)
	.add('Pure essence', 30, 12)
	.add('Mithril bar', [10, 15], 6)
	.add('Broken antler', 1, 4)
	.add('Raw beef', 1, 4)
	.add('Huasca seed', [2, 3], 1)

	/* Coins */
	.add('Coins', [1180, 3000], 19)
	.add("Alchemist's signet", 1, 2)

	/* Gem drop table */
	.add(GemTable, 1, 6)
	.add(RareDropTable, 1, 1);

const ElderCustodianStalkerTable = new LootTable()
	.every('Big bones')
	.every(ElderCustodianStalkerPreTable)

	/* Tertiary */
	.tertiary(400, 'Long bone')
	.tertiary(650, 'Antler guard')
	.tertiary(5013, 'Curved bone');

export const ElderCustodianStalker: SimpleMonster = new SimpleMonster({
	id: 14704,
	name: 'Elder custodian stalker',
	table: ElderCustodianStalkerTable,
	aliases: ['elder stalker', 'elder custodian stalker']
});
