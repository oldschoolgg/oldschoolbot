import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

const SpiritualRangerZarosTable = new LootTable()

	/* Ancient ceremonial robes */
	.add('Ancient ceremonial mask', 1, 1)
	.add('Ancient ceremonial top', 1, 1)
	.add('Ancient ceremonial legs', 1, 1)
	.add('Ancient ceremonial gloves', 1, 1)
	.add('Ancient ceremonial boots', 1, 1)

	/* Runes and ammunition */
	.add('Adamant bolts', 15, 35)
	.add('Nature rune', 1, 20)
	.add('Chaos rune', 1, 15)
	.add('Rune arrow', 12, 10)
	.add('Rune arrow', 50, 10)

	/* Herbs */
	.add('Grimy avantoe', 1, 15.625)
	.add('Grimy ranarr weed', 1, 12.5)
	.add('Grimy snapdragon', 1, 12.5)
	.add('Grimy torstol', 1, 9.375)

	/* Coins */
	.add('Coins', 500, 45)
	.add('Coins', [1300, 1337], 30)
	.add('Coins', 1, 10)

	/* Potions */
	.add('Ranging potion(2)', 1, 55)
	.add('Prayer potion(2)', 1, 45)
	.add('Super defence(1)', 1, 10)

	/* Other */
	.add('Mithril longsword', 1, 75)
	.add('Adamantite bar', [1, 4], 40)
	.add('Coal', [1, 10], 40)
	.add('Pure essence', 23, 40)
	.add('Blue dragon scale', 2, 35)
	.add("Green d'hide body", 1, 35)
	.add('Uncut diamond', 1, 20)
	.add('Nihil shard', [2, 7], 5)
	.add('Shark', 1, 5)

	/* RDT */
	.add(GemTable, 1, 5)

	/* Tertiary */
	.tertiary(128, 'Clue scroll (hard)');

export default new SimpleMonster({
	id: 11291,
	name: 'Spiritual Ranger (Zaros)',
	table: SpiritualRangerZarosTable,
	aliases: ['spiritual ranger zaros']
});
