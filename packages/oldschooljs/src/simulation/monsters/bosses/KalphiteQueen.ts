import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';
import RareDropTable from '../../subtables/RareDropTable';

const KqConsumablesTable = new LootTable()
	.add('Monkfish', 3, 1)
	.add('Shark', 2, 1)
	.add('Dark crab', 2, 1)
	.add('Saradomin brew(4)', 1, 1)
	.add('Prayer potion(4)', 2, 1)
	.add('Super restore(4)', 1, 1)
	.add('Super combat potion(2)', 1, 1)
	.add('Ranging potion(3)', 1, 1)
	.add('Superantipoison(2)', 1, 1);

const KalphiteQueenTable = new LootTable({ limit: 256 })

	/* Consumables */
	.every(KqConsumablesTable)

	/* Weapons and armor */
	.add('Battlestaff', 10, 10)
	.add('Rune chainbody', 1, 9)
	.add("Red d'hide body", 1, 8)
	.add('Rune knife(p++)', 25, 8)
	.add('Lava battlestaff', 1, 4)
	.add('Dragon chainbody', 1, 2)
	.add('Dragon 2h sword', 1, 1)

	/* Runes and ammunition */
	.add('Death rune', 150, 12)
	.add('Blood rune', 100, 12)
	.add('Mithril arrow', 500, 10)
	.add('Rune arrow', 250, 6)

	/* Herbs */
	.add('Grimy toadflax', 25, 4)
	.add('Grimy ranarr weed', 25, 4)
	.add('Grimy snapdragon', 25, 4)
	.add('Grimy torstol', 25, 4)

	/* Seeds */
	.add('Torstol seed', 2, 8)
	.add('Watermelon seed', 25, 6)
	.add('Papaya tree seed', 2, 6)
	.add('Palm tree seed', 2, 6)
	.add('Magic seed', 2, 6)

	/* Resources */
	.add('Runite bar', 3, 10)
	.add('Bucket of sand', 100, 8)
	.add('Gold ore', 250, 8)
	.add('Magic logs', 60, 8)
	.add('Uncut emerald', 25, 6)
	.add('Uncut ruby', 25, 6)
	.add('Uncut diamond', 25, 6)

	/* Other */
	.add('Wine of zamorak', 60, 20)
	.add('Potato cactus', 100, 16)
	.add('Coins', [15_000, 20_000], 10)
	.add('Grapes', 100, 10)
	.add('Weapon poison(++)', 5, 10)
	.add('Cactus spine', 10, 6)

	/* RDT */
	.add(RareDropTable, 1, 2)

	/* Tertiary */
	.tertiary(20, 'Ensouled kalphite head')
	.tertiary(100, 'Clue scroll (elite)')
	.tertiary(128, 'Kq head')
	.tertiary(400, 'Dragon pickaxe')
	.tertiary(2000, 'Jar of sand')
	.tertiary(3000, 'Kalphite princess');

export default new SimpleMonster({
	id: 963,
	name: 'Kalphite Queen',
	table: KalphiteQueenTable,
	aliases: ['kalphite queen', 'kq']
});
