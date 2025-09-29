import { GemTable, RareDropTable } from '@/simulation/subtables/RareDropTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

export const JuvenileCustodianStalkerPreTable = new LootTable()
	/* Runes and ammunition*/
	.add('Cannonball', [10, 15], 20)
	.add('Air rune', 100, 20)
	.add('Fire rune', 50, 20)
	.add('Rune arrow', [5, 20], 12)
	.add('Death rune', [10, 26], 10)

	/* Resources */
	.add('Pure essence', 15, 12)
	.add('Broken antler', 1, 11)
	.add('Swordfish', [2, 3], 8)
	.add('Raw beef', 1, 4)

	/* Other */
	.add('Coins', [400, 750], 20)
	.add('Adamant scimitar', 1, 16)

	/* Gem drop table */
	.add(GemTable, 1, 6)
	.add(RareDropTable, 1, 1);

const JuvenileCustodianStalkerTable = new LootTable()
	.every('Big bones')
	.every(JuvenileCustodianStalkerPreTable)

	/* Tertiary */
	.tertiary(400, 'Long bone')
	.tertiary(5013, 'Curved bone');

export default new SimpleMonster({
	id: 14702,
	name: 'Juvenile custodian stalker',
	table: JuvenileCustodianStalkerTable,
	aliases: ['juvenille stalker', 'juvy stalk', 'juvenile custodian stalker']
});
