import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';
import { UncommonSeedDropTable } from '../../../subtables/index';

const WildySlayerCaveTable = new LootTable()
	.add('Blighted entangle sack', [1, 10], 13200)
	.add('Blighted anglerfish', [1, 2], 9900)
	.add('Blighted manta ray', [1, 2], 9900)
	.add('Blighted karambwan', [1, 2], 6580)
	.add('Blighted teleport spell sack', [1, 10], 6580)
	.add('Blighted ancient ice sack', [1, 10], 6580)
	.add('Blighted vengeance sack', [1, 10], 6580)
	.add('Blighted super restore(4)', 1, 3290)
	.add('Revenant cave teleport', 1, 3290)
	.add('Dareeyak teleport', 1, 657)
	.add('Wilderness crabs teleport', 1, 657)
	.add('Carrallanger teleport', 1, 657)
	.add('Paddewwa teleport', 1, 657)
	.add('Annakarl teleport', 1, 657)
	.add('Lassar teleport', 1, 657)
	.add('Kharyrll teleport', 1, 657)
	.add('Senntisten teleport', 1, 657)
	.add('Ghorrock teleport', 1, 657)
	.add('Target teleport', 1, 657)
	.add('Magic shortbow scroll', 1, 263)
	.add('Ring of wealth scroll', 1, 263)
	.add('Trouver parchment', 2, 66)
	.add('Looting bag note', 1, 66);

const IceGiantTable = new LootTable()
	.every('Big bones')

	/* Weapons and armour */
	.add('Iron 2h sword', 1, 5)
	.add('Black kiteshield', 1, 4)
	.add('Steel axe', 1, 4)
	.add('Steel sword', 1, 4)
	.add('Iron platelegs', 1, 1)
	.add('Mithril mace', 1, 1)
	.add('Mithril sq shield', 1, 1)

	/* Runes and ammunition */
	.add('Adamant arrow', 5, 6)
	.add('Nature rune', 6, 4)
	.add('Mind rune', 24, 3)
	.add('Body rune', 37, 3)
	.add('Law rune', 3, 2)
	.add('Water rune', 12, 1)
	.add('Cosmic rune', 4, 1)
	.add('Death rune', 3, 1)
	.add('Blood rune', 2, 1)

	/* Seeds */
	.add(UncommonSeedDropTable, 1, 8)

	/* Coins */
	.add('Coins', 117, 32)
	.add('Coins', 53, 12)
	.add('Coins', 196, 10)
	.add('Coins', 8, 7)
	.add('Coins', 22, 6)
	.add('Coins', 400, 2)

	/* Other */
	.add('Jug of wine', 1, 3)
	.add('Mithril ore', 1, 1)
	.add('Banana', 1, 1)

	/* Gem drop table */
	.add(GemTable, 1, 4)

	/* Tertiary */
	.tertiary(21, 'Ensouled giant head')
	.tertiary(40, 'Clue scroll (beginner)')
	.tertiary(400, 'Long bone')
	.tertiary(5000, 'Giant champion scroll')
	.tertiary(5013, 'Curved bone');

const IceGiantWildyCaveTable = new LootTable()
	.every(IceGiantTable)
	.add(WildySlayerCaveTable, 1, 73)
	.add(new LootTable(), 1, 27);

export default new SimpleMonster({
	id: 2085,
	name: 'Ice giant',
	table: IceGiantTable,
	wildyCaveTable: IceGiantWildyCaveTable,
	aliases: ['ice giant']
});
