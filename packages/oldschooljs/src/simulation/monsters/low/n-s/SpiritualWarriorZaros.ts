import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

const SpiritualWarriorZarosTable = new LootTable()

	/* Ancient ceremonial robes */
	.add('Ancient ceremonial mask', 1, 1)
	.add('Ancient ceremonial top', 1, 1)
	.add('Ancient ceremonial legs', 1, 1)
	.add('Ancient ceremonial gloves', 1, 1)
	.add('Ancient ceremonial boots', 1, 1)

	/* Runes */
	.add('Mind rune', 1, 35)
	.add('Mud rune', 15, 35)
	.add('Nature rune', 1, 20)
	.add('Chaos rune', 1, 15)
	.add('Air rune', 150, 10)

	/* Herbs */
	.add('Grimy avantoe', 1, 15.625)
	.add('Grimy ranarr weed', 1, 12.5)
	.add('Grimy snapdragon', 1, 12.5)
	.add('Grimy torstol', 1, 9.375)

	/* Coins */
	.add('Coins', [400, 499], 45)
	.add('Coins', [1300, 1337], 30)
	.add('Coins', 1, 10)

	/* Potions */
	.add('Super attack(1)', 1, 55)
	.add('Prayer potion(2)', 1, 45)
	.add('Super defence(1)', 1, 10)
	.add('Super strength(1)', 1, 10)

	/* Other */
	.add('Mithril longsword', 1, 75)
	.add('Adamantite bar', [1, 4], 40)
	.add('Coal', [1, 10], 40)
	.add('Pure essence', 23, 40)
	.add('Adamant chainbody', 1, 35)
	.add('Potato cactus', 1, 35)
	.add('Lobster', 1, 5)
	.add('Nihil shard', [2, 5], 5)

	/* RDT */
	.add(GemTable, 1, 5)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)');

export default new SimpleMonster({
	id: 11290,
	name: 'Spiritual Warrior (Zaros)',
	table: SpiritualWarriorZarosTable,
	aliases: ['spiritual warrior zaros']
});
