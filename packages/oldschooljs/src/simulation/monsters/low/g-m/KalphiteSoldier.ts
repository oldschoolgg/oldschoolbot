import { HerbDropTable } from '@/simulation/subtables/HerbDropTable.js';
import { GemTable } from '@/simulation/subtables/RareDropTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const KalphiteSoldierTable = new LootTable({ limit: 128 })
	/* Weapons and armor */
	.add('Steel full helm', 1, 4)
	.add('Steel axe', 1, 4)
	.add('Steel scimitar', 1, 3)
	.add('Mithril chainbody', 1, 1)
	.add('Mithril sq shield', 1, 1)
	.add('Adamant med helm', 1, 1)

	/* Runes */
	.add('Fire rune', 60, 8)
	.add('Chaos rune', 12, 5)
	.add('Death rune', 3, 3)
	.add('Nature rune', 1, 2)
	.add('Fire rune', 30, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 1)

	/* Coins */
	.add('Coins', 120, 40)
	.add('Coins', 40, 29)
	.add('Coins', 200, 10)
	.add('Coins', 10, 7)
	.add('Coins', 450, 1)

	/* Other */
	.add('Waterskin(4)', 1, 3)

	/* RDT */
	.add(GemTable, 1, 4)

	/* Tertiary */
	.tertiary(90, 'Ensouled kalphite head');

export const KalphiteSoldier: SimpleMonster = new SimpleMonster({
	id: 957,
	name: 'Kalphite Soldier',
	table: KalphiteSoldierTable,
	aliases: ['kalphite soldier']
});
