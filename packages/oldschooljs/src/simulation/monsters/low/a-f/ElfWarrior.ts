import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import HerbDropTable from '../../../subtables/HerbDropTable';
import { GemTable } from '../../../subtables/RareDropTable';

const ElfWarriorTable = new LootTable()
	.every('Bones')

	/* Weapons and armour */
	.add("Green d'hide body", 1, 4)
	.add("Green d'hide chaps", 1, 3)
	.add('Mithril spear', 1, 2)
	.add('Mithril kiteshield', 1, 1)
	.add('Adamant full helm', 1, 1)
	.add('Rune dagger', 1, 1)

	/* Runes and ammunition */
	.add('Water rune', 70, 8)
	.add('Nature rune', 12, 5)
	.add('Law rune', 2, 3)
	.add('Fire rune', 37, 2)

	/* Herbs */
	.add(HerbDropTable, 1, 15)

	/* Coins */
	.add('Coins', 44, 29)
	.add('Coins', 180, 10)
	.add('Coins', 20, 5)

	/* Other */
	.add('Crystal teleport seed', 1, 25)
	.add('Bass', 1, 3)
	.add('Shark', 1, 3)
	.add('Adamantite ore', 1, 2)

	/* RDT */
	.add(GemTable, 1, 5)

	/* Tertiary */
	.tertiary(40, 'Ensouled elf head')
	.tertiary(128, 'Clue scroll (hard)');

export default new SimpleMonster({
	id: 5293,
	name: 'Elf Warrior',
	table: ElfWarriorTable,
	aliases: ['elf warrior', 'elves']
});
