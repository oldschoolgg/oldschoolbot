import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

const SpiritualMageZarosTable = new LootTable()

	/* Ancient ceremonial robes */
	.add('Ancient ceremonial mask', 1, 1)
	.add('Ancient ceremonial top', 1, 1)
	.add('Ancient ceremonial legs', 1, 1)
	.add('Ancient ceremonial gloves', 1, 1)
	.add('Ancient ceremonial boots', 1, 1)

	/* Runes */
	.add('Air rune', 250, 35)
	.add('Astral rune', [38, 98], 75)
	.add('Blood rune', 25, 10)
	.add('Lava rune', [30, 60], 45)
	.add('Death rune', 25, 20)
	.add('Mud rune', [40, 70], 35)
	.add('Smoke rune', [100, 150], 10)
	.add('Soul rune', 25, 15)

	/* Herbs */
	.add('Grimy avantoe', 1, 15.625)
	.add('Grimy ranarr weed', 1, 12.5)
	.add('Grimy snapdragon', 1, 12.5)
	.add('Grimy torstol', 1, 44.375)

	/* Coins */
	.add('Coins', [1300, 1337], 30)
	.add('Coins', [6900, 6942], 10)

	/* Potions */
	.add('Super defence(3)', 1, 10)
	.add('Super restore(3)', 1, 45)
	.add('Ancient brew(2)', 1, 55)
	.add('Ancient brew(3)', 1, 29)

	/* Other */
	.add('Adamantite bar', [1, 4], 40)
	.add('Blood essence', 1, 5)
	.add('Coal', [1, 10], 40)
	.add('Nihil shard', [5, 9], 5)
	.add('Pure essence', 46, 40)

	/* RDT */
	.add(GemTable, 1, 5)

	/* Tertiary */
	.tertiary(96, 'Clue scroll (hard)')
	.tertiary(128, 'Dragon boots');

export default new SimpleMonster({
	id: 11292,
	name: 'Spiritual Mage (Zaros)',
	table: SpiritualMageZarosTable,
	aliases: ['spiritual mage zaros']
});
