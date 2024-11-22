import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import RareDropTable, { GemTable } from '../../../subtables/RareDropTable';

const BrutalGreenDragonTable = new LootTable()
	.every('Dragon bones')
	.every('Green dragonhide', 2)

	/* Weapons and armour */
	.add('Adamant dart(p)', 25, 5)
	.add('Adamant 2h sword', 1, 4)
	.add('Mithril hasta', 1, 3)
	.add('Adamant knife', 8, 3)
	.add('Adamant med helm', 1, 3)
	.add('Rune thrownaxe', 8, 3)
	.add('Adamant spear', 1, 2)
	.add('Adamant chainbody', 1, 1)
	.add('Adamant kiteshield', 1, 1)
	.add('Adamant platelegs', 1, 1)
	.add('Rune full helm', 1, 1)
	.add('Rune chainbody', 1, 1)

	/* Runes and ammunition */
	.add('Blood rune', 20, 29)
	.add('Lava rune', 35, 8)
	.add('Steam rune', 37, 6)
	.add('Nature rune', 17, 5)
	.add('Law rune', 15, 3)
	.add('Adamant arrow', 8, 3)

	/* Herbs */
	.add(HerbDropTable, 1, 15)

	/* Materials */
	.add('Dragon javelin heads', 12, 10)
	.add('Mithril ore', 5, 3)

	/* Other */
	.add('Coins', 242, 11)
	.add('Coins', 621, 10)

	/* Other */
	.add('Curry', [1, 2], 2)

	/* Rare and Gem drop table, slightly adjusted */
	.add(RareDropTable, 1, 3)
	.add(GemTable, 1, 2)

	/* Tertiary */
	.tertiary(28, 'Ensouled dragon head')
	.tertiary(128, 'Clue scroll (hard)');

export default new SimpleMonster({
	id: 2918,
	name: 'Brutal green Dragon',
	table: BrutalGreenDragonTable,
	aliases: ['brutal green dragon', 'brutal greens', 'brutal green']
});
