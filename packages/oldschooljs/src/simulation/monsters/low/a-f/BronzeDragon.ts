import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import RareDropTable, { GemTable } from '../../../subtables/RareDropTable';

const BronzeDragonTable = new LootTable()
	.every('Dragon bones')
	.every('Bronze bar', 5)

	/* Pre-roll */
	.oneIn(2048, 'Dragon plateskirt')
	.oneIn(2048, 'Dragon platelegs')

	/* Weapons and armour */
	.add('Adamant dart(p)', 1, 7)
	.add('Mithril 2h sword', 1, 4)
	.add('Mithril axe', 1, 3)
	.add('Mithril battleaxe', 1, 3)
	.add('Rune knife', 1, 3)
	.add('Mithril kiteshield', 1, 1)
	.add('Adamant platebody', 1, 1)
	.add('Rune longsword', 1, 1)

	/* Runes and ammunition */
	.add('Adamant javelin', 20, 20)
	.add('Fire rune', 50, 8)
	.add('Mithril bolts', [2, 12], 6)
	.add('Law rune', 10, 5)
	.add('Blood rune', 15, 3)
	.add('Death rune', 25, 1)

	/* Coins */
	.add('Coins', 196, 40)
	.add('Coins', 330, 10)
	.add('Coins', 690, 1)

	/* Other */
	.add('Adamantite bar', 1, 3)
	.add('Swordfish', 2, 2)
	.add('Swordfish', 1, 1)

	/* Rare and Gem drop table, slightly adjusted */
	.add(RareDropTable, 1, 1)
	.add(GemTable, 1, 4)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)');

export default new SimpleMonster({
	id: 270,
	name: 'Bronze Dragon',
	table: BronzeDragonTable,
	aliases: ['bronze dragon']
});
