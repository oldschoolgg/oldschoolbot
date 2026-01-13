import { HerbDropTable } from '@/simulation/subtables/HerbDropTable.js';
import { GemTable, RareDropTable } from '@/simulation/subtables/RareDropTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const ZamorakRobesTable: LootTable = new LootTable()
	.add('Zamorak monk top', 1, 4)
	.add('Zamorak monk top', 1, 4)
	.add('Elder chaos hood', 1, 1)
	.add('Elder chaos robe', 1, 1)
	.add('Elder chaos top', 1, 1);

export const ElderChaosDruidTable: LootTable = new LootTable()
	.every('Bones')
	.add(ZamorakRobesTable, 1, 1)

	/* Runes and ammunition */
	.add('Law rune', 6, 7)
	.add('Mithril bolts', [8, 28], 6)
	.add('Air rune', 56, 5)
	.add('Body rune', 19, 5)
	.add('Chaos rune', 7, 5)
	.add('Earth rune', 19, 5)
	.add('Mind rune', 22, 5)
	.add('Nature rune', 12, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 15)
	.add(HerbDropTable, 2, 20)
	.add(HerbDropTable, 3, 15)
	.add(HerbDropTable, 4, 5)

	/* Coins */
	.add('Coins', 80, 7)
	.add('Coins', 250, 6)

	/* Other */
	.add('Vial of water', 4, 10)
	.add('Steel longsword', 1, 5)
	.add('Dark fishing bait', [10, 24], 2)
	.add('Snape grass', 4, 1)
	.add('Unholy mould', 1, 1)

	/* Gem drop table */
	.add(RareDropTable, 1, 1)
	.add(GemTable, 1, 1)

	/* Tertiary */
	.tertiary(20, 'Ensouled chaos druid head')
	.tertiary(128, 'Clue scroll (hard)');

export const ElderChaosDruid: SimpleMonster = new SimpleMonster({
	id: 6607,
	name: 'Elder Chaos druid',
	table: ElderChaosDruidTable,
	aliases: ['elder chaos druid']
});
