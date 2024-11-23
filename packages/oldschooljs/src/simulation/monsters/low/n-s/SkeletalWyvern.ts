import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import RareDropTable from '../../../subtables/RareDropTable';

const SkeletalWyvernTable = new LootTable()
	.every('Wyvern bones')

	/* Weapons and armour */
	.add('Earth battlestaff', 1, 4)
	.add('Battlestaff', 10, 3)
	.add('Rune axe', 1, 3)
	.add('Rune battleaxe', 1, 2)
	.add('Rune warhammer', 1, 2)
	.add('Rune full helm', 1, 2)
	.add('Rune kiteshield', 1, 1)
	.oneIn(512, 'Granite legs')
	.oneIn(512, 'Dragon platelegs')
	.oneIn(512, 'Dragon plateskirt')

	/* Runes and ammunition */
	.add('Air rune', 225, 6)
	.add('Rune arrow', 36, 5)
	.add('Water rune', 150, 4)
	.add('Chaos rune', 80, 4)
	.add('Law rune', 45, 4)
	.add('Death rune', 40, 4)
	.add('Blood rune', 25, 4)
	.add('Adamant bolts', [75, 99], 3)
	.add('Runite bolts', [35, 44], 3)
	.add('Soul rune', 20, 1)

	/* Herbs */
	.add(HerbDropTable, 3, 7)

	/* Resources */
	.add('Pure essence', 250, 8)
	.add('Magic logs', 35, 6)
	.add('Adamantite bar', 10, 6)
	.add('Iron ore', 200, 3)
	.add('Uncut ruby', 10, 2)
	.add('Uncut diamond', 5, 2)

	/* Other */
	.add('Coins', 300, 12)
	.add('Lobster', 6, 8)
	.add('Prayer potion(4)', 2, 7)
	.add('Unpowered orb', 75, 2)
	.add('Runite crossbow (u)', 1, 2)
	.add('Ranarr seed', 3, 2)
	.add('Snapdragon seed', 1, 2)

	/* RDT */
	.add(RareDropTable, 1, 3)

	/* Tertiary */
	.tertiary(350, 'Clue scroll (elite)')
	.tertiary(10_000, 'Draconic visage');

export default new SimpleMonster({
	id: 465,
	name: 'Skeletal Wyvern',
	table: SkeletalWyvernTable,
	aliases: ['skeletal wyvern']
});
