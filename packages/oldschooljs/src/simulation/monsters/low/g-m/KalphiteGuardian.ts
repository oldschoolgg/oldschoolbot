import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import RareDropTable, { GemTable } from '../../../subtables/RareDropTable';

const KalphiteGuardianTable = new LootTable({ limit: 128 })

	/* Weapons and armor */
	.add('Mithril sword', 1, 4)
	.add('Steel battleaxe', 1, 3)
	.add('Mithril axe', 1, 2)
	.add('Adamant dagger', 1, 2)
	.add('Mithril kiteshield', 1, 1)
	.add('Rune med helm', 1, 1)
	.add('Rune chainbody', 1, 1)

	/* Runes */
	.add('Air rune', 50, 8)
	.add('Chaos rune', 10, 7)
	.add('Blood rune', 7, 4)
	.add('Fire rune', 37, 1)
	.add('Law rune', 3, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 23)

	/* Coins */
	.add('Coins', 132, 40)
	.add('Coins', 30, 7)
	.add('Coins', 44, 6)
	.add('Coins', 220, 6)
	.add('Coins', 460, 1)

	/* Other */
	.add('Lobster', 1, 3)
	.add('Defence potion(3)', 1, 1)

	/* RDT */
	.add(RareDropTable, 1, 1)
	.add(GemTable, 1, 5)

	/* Tertiary */
	.tertiary(35, 'Ensouled kalphite head');

export default new SimpleMonster({
	id: 959,
	name: 'Kalphite Guardian',
	table: KalphiteGuardianTable,
	aliases: ['kalphite guardian']
});
