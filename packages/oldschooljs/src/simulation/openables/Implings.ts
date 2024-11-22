import LootTable from '../../structures/LootTable';
import SimpleOpenable from '../../structures/SimpleOpenable';
import { EasyClueTable } from '../clues/Easy';
import { EliteClueTable } from '../clues/Elite';
import { HardClueTable } from '../clues/Hard';
import { MasterClueTable } from '../clues/Master';
import { MediumClueTable } from '../clues/Medium';

export const BabyImpling = new SimpleOpenable({
	id: 11_238,
	name: 'Baby impling',
	aliases: ['baby impling', 'baby imp', 'baby'],
	table: new LootTable()
		.add('Chisel', 1, 10)
		.add('Thread', 1, 10)
		.add('Needle', 1, 10)
		.add('Knife', 1, 10)
		.add('Cheese', 1, 10)
		.add('Hammer', 1, 10)
		.add('Ball of wool', 1, 10)
		.add('Anchovies', 1, 10)
		// 'Nothing' drop:
		.add(new LootTable(), 1, 10)
		.add('Spice')
		.add('Flax')
		.add('Mud pie')
		.add('Seaweed')
		.add('Air talisman')
		.add('Silver bar')
		.add('Sapphire')
		.add('Hard leather')
		.add('Lobster')
		.add('Soft clay')
		.tertiary(50, 'Clue scroll (beginner)')
		.tertiary(100, 'Clue scroll (easy)')
});

export const YoungImpling = new SimpleOpenable({
	id: 11_240,
	name: 'Young impling',
	aliases: ['young impling', 'young imp', 'young'],
	table: new LootTable()
		.add('Steel nails', 1, 10)
		.add('Lockpick', 1, 10)
		.add('Pure essence', 1, 10)
		.add('Tuna', 1, 10)
		.add('Chocolate slice', 1, 10)
		.add('Steel axe', 1, 10)
		.add('Meat pizza', 1, 10)
		.add('Coal', 1, 10)
		.add('Bow string', 1, 10)
		.add('Snape grass')
		.add('Soft clay')
		.add('Studded chaps')
		.add('Steel full helm')
		.add('Oak plank')
		.add('Defence potion(3)')
		.add('Mithril bar')
		.add('Yew longbow')
		.add('Garden pie')
		.add('Jangerberries')
		.tertiary(25, 'Clue scroll (beginner)')
		.tertiary(50, 'Clue scroll (easy)')
});

export const GourmetImpling = new SimpleOpenable({
	id: 11_242,
	name: 'Gourmet impling',
	aliases: ['gourmet impling', 'gourmet imp', 'gourmet'],
	table: new LootTable()
		.oneIn(500, 'Grubby key')
		.add('Tuna', 1, 20)
		.add('Bass', 1, 10)
		.add('Curry', 1, 10)
		.add('Meat pie', 1, 10)
		.add('Chocolate cake', 1, 10)
		.add('Frog spawn', 1, 10)
		.add('Spice', 1, 10)
		.add('Curry leaf', 1, 10)
		.add('Ugthanki kebab')
		.add('Lobster', 4)
		.add('Shark', 3)
		.add('Fish pie')
		.add("Chef's delight")
		.add('Rainbow fish', 5)
		.add('Garden pie', 6)
		.add('Swordfish', 3)
		.add('Strawberries(5)')
		.add('Cooked karambwan', 2)
		.tertiary(25, 'Clue scroll (easy)')
});

export const EarthImpling = new SimpleOpenable({
	id: 11_244,
	name: 'Earth impling',
	aliases: ['earth impling', 'earth imp', 'earth'],
	table: new LootTable()
		.add('Fire talisman', 1, 10)
		.add('Earth talisman', 1, 10)
		.add('Earth tiara', 1, 10)
		.add('Earth rune', 32, 10)
		.add('Mithril ore', 1, 10)
		.add('Bucket of sand', 4, 10)
		.add('Unicorn horn', 1, 10)
		.add('Compost', 6, 10)
		.add('Gold ore', 1, 10)
		.add('Steel bar')
		.add('Mithril pickaxe')
		.add('Wildblood seed', 2)
		.add('Jangerberry seed', 2)
		.add('Supercompost', 2)
		.add('Mithril ore', 3)
		.add('Harralander seed', 2)
		.add('Coal', 6)
		.add('Emerald', 2)
		.add('Ruby')
		.tertiary(100, 'Clue scroll (medium)')
});

export const EssenceImpling = new SimpleOpenable({
	id: 11_246,
	name: 'Essence impling',
	aliases: ['essence impling', 'essence imp', 'essence'],
	table: new LootTable()
		.add('Pure essence', 20, 10)
		.add('Water rune', 30, 10)
		.add('Air rune', 30, 10)
		.add('Fire rune', 50, 10)
		.add('Mind rune', 25, 10)
		.add('Body rune', 28, 10)
		.add('Chaos rune', 4, 10)
		.add('Cosmic rune', 4, 10)
		.add('Mind talisman', 1, 10)
		.add('Pure essence', 35)
		.add('Lava rune', 4)
		.add('Mud rune', 4)
		.add('Smoke rune', 4)
		.add('Steam rune', 4)
		.add('Death rune', 13)
		.add('Law rune', 13)
		.add('Blood rune', 7)
		.add('Soul rune', 11)
		.add('Nature rune', 13)
		.tertiary(50, 'Clue scroll (medium)')
});

export const EclecticImpling = new SimpleOpenable({
	id: 11_248,
	name: 'Eclectic impling',
	aliases: ['eclectic impling', 'eclectic imp', 'ecl', 'eclectic'],
	table: new LootTable()
		.add('Mithril pickaxe', 1, 10)
		.add('Curry leaf', 1, 10)
		.add('Snape grass', 1, 10)
		.add('Air rune', [30, 58], 10)
		.add('Oak plank', 4, 10)
		.add('Empty candle lantern', 1, 10)
		.add('Gold ore', 1, 10)
		.add('Gold bar', 5, 10)
		.add('Unicorn horn', 1, 10)
		.add('Adamant kiteshield')
		.add("Blue d'hide chaps")
		.add('Red spiky vambraces')
		.add('Rune dagger')
		.add('Battlestaff')
		.add('Adamantite ore', 10)
		.add("Slayer's respite", 2)
		.add('Wild pie')
		.add('Watermelon seed', 3)
		.add('Diamond')
		.tertiary(25, 'Clue scroll (medium)')
});

export const NatureImpling = new SimpleOpenable({
	id: 11_250,
	name: 'Nature impling',
	aliases: ['nature impling', 'nature imp', 'nature'],
	table: new LootTable()
		.add('Limpwurt seed', 1, 10)
		.add('Jangerberry seed', 1, 10)
		.add('Belladonna seed', 1, 10)
		.add('Harralander seed', 1, 10)
		.add('Cactus spine', 1, 10)
		.add('Magic logs', 1, 10)
		.add('Tarromin', 1, 10)
		.add('Coconut', 1, 10)
		.add('Irit seed', 1, 10)
		.add('Curry tree seed')
		.add('Orange tree seed')
		.add('Snapdragon')
		.add('Kwuarm seed')
		.add('Avantoe seed', 5)
		.add('Willow seed')
		.add('Torstol seed')
		.add('Ranarr seed')
		.add('Torstol', 2)
		.add('Dwarf weed seed')
		.tertiary(100, 'Clue scroll (hard)')
});

export const MagpieImpling = new SimpleOpenable({
	id: 11_252,
	name: 'Magpie impling',
	aliases: ['magpie impling', 'magpie imp', 'magpie'],
	table: new LootTable()
		.add('Black dragonhide', 6, 2)
		.add('Diamond amulet', 3)
		.add('Amulet of power', 3)
		.add('Ring of forging', 3)
		.add('Splitbark gauntlets')
		.add('Mystic boots')
		.add('Mystic gloves')
		.add('Rune warhammer')
		.add('Ring of life', 4)
		.add('Rune sq shield')
		.add('Dragon dagger')
		.add('Nature tiara')
		.add('Runite bar', 2)
		.add('Diamond', 4)
		.add('Pineapple seed')
		.add('Ring of recoil', 3)
		.add('Loop half of key')
		.add('Tooth half of key')
		.add('Snapdragon seed')
		.add('Sinister key')
		.tertiary(50, 'Clue scroll (hard)')
});

export const NinjaImpling = new SimpleOpenable({
	id: 11_254,
	name: 'Ninja impling',
	aliases: ['ninja impling', 'ninja imp', 'ninja'],
	table: new LootTable()
		.add('Snakeskin boots')
		.add('Splitbark helm')
		.add('Mystic boots')
		.add('Rune chainbody')
		.add('Mystic gloves')
		.add('Opal machete')
		.add('Rune claws')
		.add('Rune scimitar')
		.add('Dragon dagger(p+)')
		.add('Rune arrow', 70)
		.add('Rune dart', 70)
		.add('Rune knife', 40)
		.add('Rune thrownaxe', 50)
		.add('Onyx bolts', 2)
		.add('Onyx bolt tips', 4)
		.add('Black dragonhide', 10)
		.add('Prayer potion(3)', 4)
		.add('Weapon poison(+)', 4)
		.add('Dagannoth hide', 3)
		.tertiary(25, 'Clue scroll (hard)')
});

export const CrystalImpling = new SimpleOpenable({
	id: 23_768,
	name: 'Crystal impling',
	aliases: ['crystal impling', 'crystal imp', 'crystal'],
	table: new LootTable()
		.add('Amulet of power', [5, 7])
		.add('Crystal acorn')
		.add('Crystal shard', [5, 10])
		.add('Dragonstone amulet')
		.add('Dragonstone', 2)
		.add('Ruby bolt tips', [50, 125])
		.add('Onyx bolt tips', [6, 10])
		.add('Rune arrowtips', [150, 250])
		.add('Rune arrow', [400, 750])
		.add('Rune javelin heads', [20, 60])
		.add('Rune dart tip', [25, 75])
		.add('Rune dart', [50, 100])
		.add('Dragon dart tip', [10, 15])
		.add('Dragon dagger', 2)
		.add('Rune scimitar', [3, 6])
		.add('Babydragon bones', [75, 125])
		.add('Ranarr seed', [3, 8])
		.add('Yew seed')
		.tertiary(50, 'Clue scroll (elite)')
		.tertiary(128, 'Elven signet')
});

export const DragonImpling = new SimpleOpenable({
	id: 11_256,
	name: 'Dragon impling',
	aliases: ['dragon impling', 'dragon imp', 'dimp', 'dragon'],
	table: new LootTable()
		.add('Dragonstone bolt tips', [10, 30])
		.add('Dragonstone bolt tips', 36)
		.add('Mystic robe bottom', 1)
		.add('Amulet of glory', 3)
		.add('Dragonstone amulet', 2)
		.add('Dragon arrow', [100, 250])
		.add('Dragonstone bolts', [10, 40])
		.add('Dragon longsword', 1)
		.add('Dragon dagger(p++)', 3)
		.add('Dragon dart', [100, 250])
		.add('Dragonstone', 3)
		.add('Dragon dart tip', [100, 350])
		.add('Dragon arrowtips', [100, 350])
		.add('Dragon javelin heads', [25, 35])
		.add('Babydragon bones', [100, 300])
		.add('Dragon bones', [50, 100])
		.add('Magic seed', 1)
		.add('Snapdragon seed', 6)
		.add('Summer pie', 15)
		.tertiary(50, 'Clue scroll (elite)')
});

export const LuckyImpling = new SimpleOpenable({
	id: 19_732,
	name: 'Lucky impling',
	aliases: ['lucky impling', 'lucky imp', 'lucky', 'luckys'],
	table: new LootTable()
		.add(EasyClueTable)
		.add(MediumClueTable)
		.add(HardClueTable)
		.add(EliteClueTable)
		.add(MasterClueTable)
});

export const Implings = [
	BabyImpling,
	YoungImpling,
	GourmetImpling,
	EarthImpling,
	EssenceImpling,
	EclecticImpling,
	NatureImpling,
	MagpieImpling,
	NinjaImpling,
	CrystalImpling,
	DragonImpling,
	LuckyImpling
];
