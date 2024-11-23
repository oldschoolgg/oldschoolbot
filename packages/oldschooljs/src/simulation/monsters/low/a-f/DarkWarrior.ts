import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';

export const DarkWarriorTable = new LootTable({ limit: 128 })
	.every('Bones')

	/* Weapons and armour */
	.add('Bronze med helm', 1, 3)
	.add('Iron mace', 1, 1)
	.add('Black med helm', 1, 1)
	.add('Black mace', 1, 1)

	/* Runes and ammunition */
	.add('Bronze arrow', 8, 4)
	.add('Mind rune', 2, 3)
	.add('Water rune', 3, 2)
	.add('Nature rune', 3, 2)
	.add('Earth rune', 2, 1)
	.add('Chaos rune', 2, 1)

	/* Herbs */
	.add(HerbDropTable, 1, 3)

	/* Coins */
	.add('Coins', 1, 31)
	.add('Coins', 2, 20)
	.add('Coins', 6, 20)
	.add('Coins', 13, 7)
	.add('Coins', 20, 6)
	.add('Coins', 30, 2)

	/* Other */
	.add('Iron ore', 1, 1)
	.add('Sardine', 1, 1);

export default new SimpleMonster({
	id: 531,
	name: 'Dark warrior',
	table: DarkWarriorTable,
	aliases: ['dark warrior']
});
