import LootTable from '@/structures/LootTable.js';
import { SimpleMonster } from '@/structures/Monster.js';

const BrandaTable = new LootTable()
	.add('Mystic fire staff', 2, 12)
	.add('Fire battlestaff', 3, 12)
	.add('Rune plateskirt', 1, 12)
	.add('Rune scimitar', 1, 12)
	.add('Rune pickaxe', 1, 12)

	.add('Chaos rune', [100, 200], 15)
	.add('Death rune', [75, 150], 15)
	.add('Nature rune', [50, 75], 15)
	.add('Law rune', [50, 75], 15)
	.add('Soul rune', [50, 75], 15)
	.add('Blood rune', [50, 75], 15)
	.add('Rune arrow', [50, 150], 15)
	.add('Fire rune', [750, 1500], 15)

	.add('Gold ore', [30, 50], 15)
	.add('Fire orb', [10, 20], 15)
	.add('Coal', [140, 160], 14)

	.add('Grimy avantoe', [3, 4], 14)
	.add('Grimy cadantine', [3, 4], 14)
	.add('Grimy dwarf weed', [3, 4], 14)
	.add('Grimy irit leaf', [3, 4], 14)
	.add('Grimy kwuarm', [3, 4], 14)
	.add('Grimy lantadyme', [3, 4], 14)
	.add('Grimy ranarr weed', [3, 4], 14)

	.add('Maple seed', [2, 3], 7)
	.add('Palm tree seed', 1, 6)
	.add('Yew seed', 1, 6)

	.add('Coins', [5000, 15000], 16)
	.add('Desiccated page', [3, 12], 16)
	.add('Prayer potion(4)', [1, 2], 14);

const TotalBrandaTable = new LootTable()
	.every(BrandaTable, 2)
	.oneIn(32, 'Giantsoul amulet (uncharged)')
	.oneIn(150, 'Fire element staff crown')
	.oneIn(150, 'Mystic vigour prayer scroll')
	.tertiary(25, 'Clue scroll (hard)')
	.tertiary(100, 'Clue scroll (elite)')
	.tertiary(3000, 'Bran');

const EldricTable = new LootTable()
	.add('Water battlestaff', 3, 8)
	.add('Rune platelegs', 1, 8)
	.add('Rune sq shield', 1, 8)
	.add('Rune axe', 1, 8)
	.add('Mystic water staff', 2, 7)
	.add('Rune pickaxe', 1, 5)

	.add('Chaos rune', [100, 200], 9)
	.add('Death rune', [75, 150], 9)
	.add('Nature rune', [50, 75], 9)
	.add('Law rune', [50, 75], 9)
	.add('Soul rune', [50, 75], 9)
	.add('Blood rune', [50, 75], 9)
	.add('Rune arrow', [50, 150], 8)
	.add('Water rune', [750, 1500], 7)

	.add('Coal', [140, 160], 9)
	.add('Gold ore', [30, 50], 9)
	.add('Water orb', [10, 20], 7)

	.add('Avantoe seed', 2, 7)
	.add('Cadantine seed', 2, 7)
	.add('Dwarf weed seed', 1, 7)
	.add('Irit seed', 2, 7)
	.add('Kwuarm seed', 2, 7)
	.add('Lantadyme seed', 2, 7)
	.add('Ranarr seed', 2, 7)

	.add('Maple seed', [2, 3], 4)
	.add('Palm tree seed', 1, 4)
	.add('Yew seed', 1, 4)

	.add('Coins', [5000, 15000], 9)
	.add('Prayer potion(4)', [1, 2], 9)
	.add('Desiccated page', [3, 12], 9);

const TotalEldricTable = new LootTable()
	.every(EldricTable, 2)
	.oneIn(32, 'Giantsoul amulet (uncharged)')
	.oneIn(150, 'Ice element staff crown')
	.oneIn(150, 'Deadeye prayer scroll')
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
	table: TotalBrandaTable,
	aliases: ['royal titans (branda)', 'branda', 'fire queen']
});

export const Eldric = new SimpleMonster({
	id: 14147,
	name: 'Royal Titans (Eldric)',
	table: TotalEldricTable,
	aliases: ['royal titans (eldric)', 'eldric', 'ice king']
});

export const RoyalTitans = new SimpleMonster({
	id: 14148,
	name: 'Royal Titans (sacrifice)',
	table: RoyalTitansSacTable,
	aliases: ['royal titans (sacrifice)', 'royal', 'titans', 'sacrifice']
});
