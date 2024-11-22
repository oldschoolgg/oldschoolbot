import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

export const ChaosDruidTable = new LootTable({ limit: 128 })
	.every('Bones')

	/* Runes and ammunition */
	.add('Law rune', 2, 7)
	.add('Mithril bolts', [2, 12], 4)
	.add('Air rune', 36, 3)
	.add('Body rune', 9, 2)
	.add('Earth rune', 9, 2)
	.add('Mind rune', 12, 2)
	.add('Nature rune', 3, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 35)
	.add(HerbDropTable, 2, 11)

	/* Coins */
	.add('Coins', 3, 5)
	.add('Coins', 8, 5)
	.add('Coins', 29, 3)
	.add('Coins', 35, 1)

	/* Other */
	.add('Vial of water', 1, 10)
	.add('Bronze longsword', 1, 1)
	.add('Snape grass', 1, 1)
	.add('Unholy mould', 1, 1)

	/* Gem drop table */
	.add(GemTable, 1, 1)

	/* Tertiary */
	.tertiary(35, 'Ensouled chaos druid head');

export default new SimpleMonster({
	id: 520,
	name: 'Chaos druid',
	table: ChaosDruidTable,
	aliases: ['chaos druid']
});
