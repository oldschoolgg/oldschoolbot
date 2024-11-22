import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import FixedAllotmentSeedTable from '../../../subtables/FixedAllotmentSeedTable';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

const HillGiantTable = new LootTable({ limit: 128 })
	.every('Big bones')
	.tertiary(25, 'Ensouled giant head')
	.tertiary(50, 'Clue scroll (beginner)')
	.tertiary(400, 'Long bone')
	.tertiary(5000, 'Giant champion scroll')
	.tertiary(5013, 'Curved bone')

	/* Weapons and armour */
	.add('Iron full helm', 1, 5)
	.add('Iron dagger', 1, 4)
	.add('Iron kiteshield', 1, 3)
	.add('Steel longsword', 1, 2)

	/* Runes and ammunition */
	.add('Iron arrow', 3, 6)
	.add('Fire rune', 15, 3)
	.add('Water rune', 7, 3)
	.add('Law rune', 2, 3)
	.add('Steel arrow', 10, 2)
	.add('Mind rune', 3, 2)
	.add('Cosmic rune', 2, 2)
	.add('Nature rune', 6, 2)
	.add('Chaos rune', 2, 1)
	.add('Death rune', 2, 1)

	/* Coins */
	.add('Coins', 38, 14)
	.add('Coins', 52, 10)
	.add('Coins', 15, 8)
	.add('Coins', 8, 6)
	.add('Coins', 88, 2)

	/* Other */
	.add(FixedAllotmentSeedTable, 1, 18)
	.add(HerbDropTable, 1, 7)
	.add('Limpwurt root', 1, 11)
	.add('Beer', 1, 6)
	.add('Body talisman', 1, 2)
	.add('Giant key', 1, 1)

	/* Gem drop table */
	.add(GemTable, 1, 3);

export default new SimpleMonster({
	id: 2098,
	name: 'Hill Giant',
	table: HillGiantTable,
	aliases: ['hill giant']
});
