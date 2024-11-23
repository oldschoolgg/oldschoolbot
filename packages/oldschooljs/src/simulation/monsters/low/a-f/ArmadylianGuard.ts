import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

export const ArmadylianGuardTable = new LootTable()
	.every('Bones')

	/* Weapons and armour */
	.add('Rune thrownaxe', 6, 3)
	.add('Rune spear', 1, 1)
	.oneIn(1_000_000, 'Armadyl helmet')
	.oneIn(1_000_000, 'Bandos boots')

	/* Runes */
	.add('Nature rune', 20, 5)
	.add('Blood rune', 20, 5)
	.add('Cosmic rune', 20, 5)

	/* Herbs */
	.add(HerbDropTable, 1, 10)

	/* Coins */
	.add('Coins', 35, 37)
	.add('Coins', 350, 12)

	/* Other */
	.add('Headless arrow', 30, 10)
	.add('Coal', 1, 7)
	.add('Hammer', 1, 5)
	.add('Feather', 30, 5)
	.add('Shark', 1, 3)
	.add('Adamantite bar', 5, 1)

	/* Gem drop table */
	.add(GemTable, 1, 9);

export default new SimpleMonster({
	id: 6587,
	name: 'Armadylian Guard',
	table: ArmadylianGuardTable,
	aliases: ['armadylian guard', 'arma guard']
});
