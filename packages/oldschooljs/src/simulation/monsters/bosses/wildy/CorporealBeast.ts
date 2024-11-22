import LootTable from '../../../../structures/LootTable';
import SimpleMonster from '../../../../structures/SimpleMonster';
import { GemTable } from '../../../subtables/RareDropTable';

const SigilTable = new LootTable().add('Spectral sigil', 1, 3).add('Arcane sigil', 1, 3).add('Elysian sigil', 1, 1);

export const CorporealBeastTable = new LootTable()

	.add('Spirit shield', 1, 8)
	.add('Holy elixir', 1, 3)
	.oneIn(585, SigilTable)

	/* Uncuts */
	.add(GemTable, 10, 12)

	/* Weapons and armour */
	.add('Mystic robe top', 1, 18)
	.add('Mystic robe bottom', 1, 18)
	.add('Mystic air staff', 1, 12)
	.add('Mystic water staff', 1, 12)
	.add('Mystic earth staff', 1, 12)
	.add('Mystic fire staff', 1, 12)

	/* Runes */
	.add('Soul rune', 250, 32)
	.add('Runite bolts', 250, 24)
	.add('Death rune', 300, 22)
	.add('Onyx bolts (e)', 175, 20)
	.add('Cannonball', 2000, 17)
	.add('Adamant arrow', 750, 17)
	.add('Law rune', 250, 17)
	.add('Cosmic rune', 500, 17)

	/* Resources */
	.add('Raw shark', 70, 21)
	.add('Pure essence', 2500, 21)
	.add('Adamantite bar', 35, 18)
	.add('Green dragonhide', 100, 18)
	.add('Adamantite ore', 125, 17)
	.add('Runite ore', 20, 12)
	.add('Teak plank', 100, 12)
	.add('Mahogany logs', 150, 12)
	.add('Magic logs', 75, 12)

	/* Other */
	.add('Tuna potato', 30, 20)
	.add('White berries', 120, 17)
	.add('Desert goat horn', 120, 17)
	.add('Watermelon seed', 24, 15)
	.add('Coins', [20_000, 50_000], 12)
	.add('Antidote++(4)', 40, 10)
	.add('Ranarr seed', 10, 5)

	/* Tertiary */
	.tertiary(200, 'Clue scroll (elite)')
	.tertiary(1000, 'Jar of spirits')
	.tertiary(5000, 'Pet dark core');

export default new SimpleMonster({
	id: 319,
	name: 'Corporeal Beast',
	table: CorporealBeastTable,
	aliases: ['corporeal beast', 'corp']
});
