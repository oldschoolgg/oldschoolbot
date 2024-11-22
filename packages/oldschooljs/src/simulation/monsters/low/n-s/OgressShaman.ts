import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';
import { UncommonSeedDropTable } from '../../../subtables/index';

const OgressShamanTable = new LootTable()
	.every('Big bones')

	/* Armour */
	.add('Mithril kiteshield', 1, 7)

	/* Runes and ammunition */
	.add('Mithril arrow', [5, 15], 7)
	.add('Chaos rune', [15, 30], 7)
	.add('Law rune', [8, 15], 7)
	.add('Nature rune', [8, 15], 7)
	.add('Death rune', [8, 15], 6)
	.add('Air rune', [10, 20], 5)
	.add('Cosmic rune', [10, 15], 5)
	.add('Earth rune', [10, 20], 5)
	.add('Fire rune', [10, 20], 5)
	.add('Mind rune', [10, 20], 5)
	.add('Water rune', [10, 20], 5)
	.add('Steel arrow', [10, 30], 5)
	.add('Iron arrow', [20, 40], 5)

	/* Seeds */
	.add(UncommonSeedDropTable, 1, 5)

	/* Materials */
	.add('Limpwurt root', 1, 5)
	.add('Uncut diamond', 1, 4)
	.add('Uncut emerald', 1, 4)
	.add('Uncut ruby', 1, 4)
	.add('Uncut sapphire', 1, 4)

	/* Coins */
	.add('Coins', [500, 1000], 9)

	/* Gem drop table */
	.add(GemTable, 1, 4)

	/* Tertiary */
	.tertiary(20, 'Salmon', [1, 3])
	.tertiary(30, 'Ensouled ogre head')
	.tertiary(40, 'Rune med helm')
	.tertiary(100, 'Rune full helm')
	.tertiary(100, 'Rune battleaxe')
	.tertiary(400, 'Long bone')
	.tertiary(1200, 'Shaman mask')
	.tertiary(5013, 'Curved bone');

export default new SimpleMonster({
	id: 7991,
	name: 'Ogress Shaman',
	table: OgressShamanTable,
	aliases: ['ogress shaman']
});
