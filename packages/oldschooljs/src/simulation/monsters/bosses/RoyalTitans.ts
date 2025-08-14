import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';

const BrandaTable = new LootTable()
	.oneIn(32, 'Giantsoul amulet (uncharged)')
	.oneIn(150, 'Fire element staff crown')
	.oneIn(150, 'Mystic vigour prayer scroll')

	.add('Mystic fire staff', 2, (2 * 12) / 387)
	.add('Fire battlestaff', 3, (2 * 12) / 387)
	.add('Rune plateskirt', 1, (2 * 12) / 387)
	.add('Rune scimitar', 1, (2 * 12) / 387)
	.add('Rune pickaxe', 1, (2 * 12) / 387)

	.add('Chaos rune', [100, 200], (2 * 15) / 387)
	.add('Death rune', [75, 150], (2 * 15) / 387)
	.add('Nature rune', [50, 75], (2 * 15) / 387)
	.add('Law rune', [50, 75], (2 * 15) / 387)
	.add('Soul rune', [50, 75], (2 * 15) / 387)
	.add('Blood rune', [50, 75], (2 * 15) / 387)
	.add('Rune arrow', [50, 150], (2 * 15) / 387)
	.add('Fire rune', [750, 1500], (2 * 15) / 387)

	.add('Gold ore', [30, 50], (2 * 15) / 387)
	.add('Fire orb', [10, 20], (2 * 15) / 387)
	.add('Coal', [140, 160], (2 * 14) / 387)

	.add('Grimy avantoe', [3, 4], (2 * 14) / 387)
	.add('Grimy cadantine', [3, 4], (2 * 14) / 387)
	.add('Grimy dwarf weed', [3, 4], (2 * 14) / 387)
	.add('Grimy irit leaf', [3, 4], (2 * 14) / 387)
	.add('Grimy kwuarm', [3, 4], (2 * 14) / 387)
	.add('Grimy lantadyme', [3, 4], (2 * 14) / 387)
	.add('Grimy ranarr weed', [3, 4], (2 * 14) / 387)

	.add('Maple seed', [2, 3], (2 * 7) / 387)
	.add('Palm tree seed', 1, (2 * 6) / 387)
	.add('Yew seed', 1, (2 * 6) / 387)

	.add('Coins', [5000, 15000], (2 * 16) / 387)
	.add('Desiccated page', [3, 12], (2 * 16) / 387)
	.add('Prayer potion(4)', [1, 2], (2 * 14) / 387)

	.tertiary(25, 'Clue scroll (hard)')
	.tertiary(100, 'Clue scroll (elite)')
	.tertiary(3000, 'Bran');

const EldricTable = new LootTable()
	.oneIn(32, 'Giantsoul amulet (uncharged)')
	.oneIn(150, 'Ice element staff crown')
	.oneIn(150, 'Deadeye prayer scroll')

	.add('Water battlestaff', 3, (2 * 8) / 250)
	.add('Rune platelegs', 1, (2 * 8) / 250)
	.add('Rune sq shield', 1, (2 * 8) / 250)
	.add('Rune axe', 1, (2 * 8) / 250)
	.add('Mystic water staff', 2, (2 * 7) / 250)
	.add('Rune pickaxe', 1, (2 * 5) / 250)

	.add('Chaos rune', [100, 200], (2 * 9) / 250)
	.add('Death rune', [75, 150], (2 * 9) / 250)
	.add('Nature rune', [50, 75], (2 * 9) / 250)
	.add('Law rune', [50, 75], (2 * 9) / 250)
	.add('Soul rune', [50, 75], (2 * 9) / 250)
	.add('Blood rune', [50, 75], (2 * 9) / 250)
	.add('Rune arrow', [50, 150], (2 * 8) / 250)
	.add('Water rune', [750, 1500], (2 * 7) / 250)

	.add('Coal', [140, 160], (2 * 9) / 250)
	.add('Gold ore', [30, 50], (2 * 9) / 250)
	.add('Water orb', [10, 20], (2 * 7) / 250)

	.add('Avantoe seed', 2, (2 * 7) / 250)
	.add('Cadantine seed', 2, (2 * 7) / 250)
	.add('Dwarf weed seed', 1, (2 * 7) / 250)
	.add('Irit seed', 2, (2 * 7) / 250)
	.add('Kwuarm seed', 2, (2 * 7) / 250)
	.add('Lantadyme seed', 2, (2 * 7) / 250)
	.add('Ranarr seed', 2, (2 * 7) / 250)

	.add('Maple seed', [2, 3], (2 * 4) / 250)
	.add('Palm tree seed', 1, (2 * 4) / 250)
	.add('Yew seed', 1, (2 * 4) / 250)

	.add('Coins', [5000, 15000], (2 * 9) / 250)
	.add('Prayer potion(4)', [1, 2], (2 * 9) / 250)
	.add('Desiccated page', [3, 12], (2 * 9) / 250)

	.tertiary(25, 'Clue scroll (hard)')
	.tertiary(100, 'Clue scroll (elite)')
	.tertiary(3000, 'Bran');

const RoyalTitansSacTable = new LootTable()
	.tertiary(25, 'Clue scroll (hard)')
	.tertiary(100, 'Clue scroll (elite)')
	.tertiary(1500, 'Bran');

export const Branda = new SimpleMonster({
	id: 12596,
	name: 'Royal Titans (Branda)',
	table: BrandaTable,
	aliases: ['royal titans (branda)', 'branda', 'fire queen']
});

export const Eldric = new SimpleMonster({
	id: 14147,
	name: 'Royal Titans (Eldric)',
	table: EldricTable,
	aliases: ['royal titans (eldric)', 'eldric', 'ice king']
});

export const RoyalTitans = new SimpleMonster({
	id: 14148,
	name: 'Royal Titans (sacrifice)',
	table: RoyalTitansSacTable,
	aliases: ['royal titans (sacrifice)', 'royal', 'titans', 'sacrifice']
});
