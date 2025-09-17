import LootTable from '../../../structures/LootTable';
import SimpleMonster from '../../../structures/SimpleMonster';

const BrandaTable = new LootTable({ limit: 55 })
	.add('Mystic fire staff', 2, 2)
	.add('Fire battlestaff', 3, 2)
	.add('Rune plateskirt', 1, 2)
	.add('Rune scimitar', 1, 2)
	.add('Rune pickaxe', 1, 2)

	.add('Fire rune', [750, 1500], 2)
	.add('Chaos rune', [100, 200], 2)
	.add('Death rune', [75, 150], 2)
	.add('Nature rune', [50, 75], 2)
	.add('Law rune', [50, 75], 2)
	.add('Soul rune', [50, 75], 2)
	.add('Blood rune', [50, 75], 2)
	.add('Rune arrow', [50, 150], 2)

	.add('Coal', [140, 160], 2)
	.add('Gold ore', [30, 50], 2)
	.add('Fire orb', [10, 20], 2)

	.add('Grimy avantoe', [3, 4], 2)
	.add('Grimy cadantine', [3, 4], 2)
	.add('Grimy dwarf weed', [3, 4], 2)
	.add('Grimy irit leaf', [3, 4], 2)
	.add('Grimy kwuarm', [3, 4], 2)
	.add('Grimy lantadyme', [3, 4], 2)
	.add('Grimy ranarr weed', [3, 4], 2)

	.add('Maple seed', [4, 6], 1)
	.add('Palm tree seed', 1, 1)
	.add('Yew seed', 1, 1)

	.add('Coins', [5000, 15000], 2)
	.add('Prayer potion(4)', [1, 2], 2)
	.add('Desiccated page', [3, 12], 2);

const TotalBrandaTable = new LootTable()
	.oneIn(16, 'Giantsoul amulet (uncharged)')
	.oneIn(75, 'Fire element staff crown')
	.tertiary(25, 'Clue scroll (hard)')
	.tertiary(100, 'Clue scroll (elite)')
	.tertiary(3000, 'Bran')
	.add(BrandaTable, 2);

const EldricTable = new LootTable({ limit: 56 })
	.add('Mystic water staff', 2, 2)
	.add('Water battlestaff', 3, 2)
	.add('Rune platelegs', 1, 2)
	.add('Rune sq shield', 1, 2)
	.add('Rune axe', 1, 2)
	.add('Rune pickaxe', 1, 1)

	.add('Water rune', [750, 1500], 2)
	.add('Chaos rune', [100, 200], 2)
	.add('Death rune', [75, 150], 2)
	.add('Nature rune', [50, 75], 2)
	.add('Law rune', [50, 75], 2)
	.add('Soul rune', [50, 75], 2)
	.add('Blood rune', [50, 75], 2)
	.add('Rune arrow', [50, 150], 2)
	

	.add('Coal', [140, 160], 2)
	.add('Gold ore', [30, 50], 2)
	.add('Water orb', [10, 20], 2)

	.add('Avantoe seed', 2, 2)
	.add('Cadantine seed', 2, 2)
	.add('Dwarf weed seed', 1, 2)
	.add('Irit seed', 2, 2)
	.add('Kwuarm seed', 2, 2)
	.add('Lantadyme seed', 2, 2)
	.add('Ranarr seed', 2, 2)

	.add('Maple seed', [2, 3], 1)
	.add('Palm tree seed', 1, 1)
	.add('Yew seed', 1, 1)

	.add('Coins', [5000, 15000], 2)
	.add('Prayer potion(4)', [1, 2], 2)
	.add('Desiccated page', [3, 12], 2);

const TotalEldricTable = new LootTable()
	.oneIn(16, 'Giantsoul amulet (uncharged)')
	.oneIn(75, 'Ice element staff crown')
	.tertiary(25, 'Clue scroll (hard)')
	.tertiary(100, 'Clue scroll (elite)')
	.tertiary(3000, 'Bran')
	.add(EldricTable, 2);

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
