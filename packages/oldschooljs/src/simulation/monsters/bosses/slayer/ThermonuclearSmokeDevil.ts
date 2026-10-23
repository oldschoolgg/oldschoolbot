import { GemTable } from '@/simulation/subtables/RareDropTable.js';
import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const ThermySharkTable: LootTable = new LootTable().add('Raw shark', 30, 5).add('Shark lure', 60, 3);

const ThermonuclearSmokeDevilTable: LootTable = new LootTable()
	.every('Ashes')

	/* Weapons and armor */
	.add('Rune dagger', 1, 5)
	.add('Rune chainbody', 1, 4)
	.add("Red d'hide body", 1, 3)
	.add('Rune battleaxe', 1, 3)
	.add('Mystic air staff', 1, 3)
	.add('Mystic fire staff', 1, 3)
	.add('Rune scimitar', 1, 2)
	.add('Rune knife(p++)', 50, 1)
	.add('Dragon scimitar', 1, 1)
	.add('Ancient staff', 1, 1)
	.oneIn(350, 'Occult necklace')
	.oneIn(512, 'Smoke battlestaff')
	.oneIn(2000, 'Dragon chainbody')

	/* Runes and ammunition */
	.add('Smoke rune', 100, 10)
	.add('Air rune', 300, 8)
	.add('Soul rune', 100, 8)
	.add('Rune arrow', 100, 2)

	/* Consumables */
	.add('Tuna potato', 3, 3)
	.add('Sanfew serum(4)', 2, 3)
	.add('Ugthanki kebab', 3, 1)
	.add('Prayer potion(4)', 2, 1)

	/* Resources */
	.add('Pure essence', 300, 2)
	.add('Molten glass', 100, 2)
	.add('Mithril bar', 20, 2)
	.add('Magic logs', 20, 2)
	.add('Gold ore', 200, 2)
	.add('Diamond', 10, 1)
	.add(ThermySharkTable, 1, 1)

	/* Other */
	.add('Coins', [10_000, 19_999], 15)
	.add('Desert goat horn', 50, 2)
	.add('Grimy toadflax', 15, 2)
	.add('Onyx bolt tips', 12, 2)
	.add('Snapdragon seed', 2, 2)
	.add('Ranarr seed', 2, 2)
	.add('Tinderbox', 1, 1)
	.add('Fire talisman', 1, 1)
	.add('Grapes', 100, 1)
	.add('Magic seed', 1, 1)
	.add('Dragonstone ring', 1, 1)
	.add('Crystal key', 1, 1)

	/* Gem drop table */
	.add(GemTable, 1, 2)

	/* Tertiary */
	.tertiary(96, 'Clue scroll (hard)')
	.tertiary(500, 'Clue scroll (elite)')
	.tertiary(2000, 'Jar of smoke')
	.tertiary(3000, 'Pet smoke devil');

export const ThermonuclearSmokeDevil: SimpleMonster = new SimpleMonster({
	id: 499,
	name: 'Thermonuclear smoke devil',
	table: ThermonuclearSmokeDevilTable,
	aliases: ['thermonuclear smoke devil', 'thermy', 'smoke devil boss']
});
