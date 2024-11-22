import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

const HerbTable = new LootTable()
	.add('Grimy avantoe', 1, 5)
	.add('Grimy ranarr weed', 1, 4)
	.add('Grimy snapdragon', 1, 4)
	.add('Grimy torstol', 1, 3);

const BloodReaverTable = new LootTable()
	.every('Malicious ashes')

	/* Ancient ceremonial robes */
	.add('Ancient ceremonial mask', 1, 1)
	.add('Ancient ceremonial top', 1, 1)
	.add('Ancient ceremonial legs', 1, 1)
	.add('Ancient ceremonial gloves', 1, 1)
	.add('Ancient ceremonial boots', 1, 1)

	/* Runes */
	.add('Astral rune', 25, 75)
	.add('Air rune', 250, 35)
	.add('Mud rune', 15, 35)
	.add('Mind rune', 20, 20)
	.add('Nature rune', 15, 20)
	.add('Chaos rune', 15, 15)
	.add('Air rune', 150, 10)
	.add('Blood rune', 15, 10)

	/* Herbs */
	.add(HerbTable, 1, 50)

	/* Coins */
	.add('Coins', 500, 45)
	.add('Coins', [1300, 1337], 30)
	.add('Coins', 1, 10)

	/* Potions */
	.add('Magic potion(1)', 1, 55)
	.add('Prayer potion(2)', 1, 45)
	.add('Super defence(1)', 1, 10)

	/* Other */
	.add('Adamantite bar', [1, 4], 40)
	.add('Coal', [1, 10], 40)
	.add('Pure essence', 23, 40)
	.add('Potato cactus', 1, 35)
	.add('Blood essence', 1, 5)
	.add('Nihil shard', [2, 7], 5)

	/* RDT */
	.add(GemTable, 1, 5)

	/* Tertiary */
	.tertiary(112, 'Clue scroll (hard)');

export default new SimpleMonster({
	id: 11_293,
	name: 'Blood Reaver',
	table: BloodReaverTable,
	aliases: ['blood reaver']
});
