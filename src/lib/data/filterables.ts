import { uniqueArr } from 'e';
import { resolveItems } from 'oldschooljs/dist/util/util';
import { Lampables } from '../../mahoji/lib/abstracted_commands/lampCommand';
import Potions from '../minions/data/potions';
import { allOpenables } from '../openables';
import { gracefulItems } from '../skilling/skills/agility';
import { Craftables } from '../skilling/skills/crafting/craftables';
import { Fletchables } from '../skilling/skills/fletching/fletchables';
import Grimy from '../skilling/skills/herblore/mixables/grimy';
import PotionsMixable from '../skilling/skills/herblore/mixables/potions';
import unfinishedPotions from '../skilling/skills/herblore/mixables/unfinishedPotions';
import { allCollectionLogs } from './Collections';
import {
	allClueItems,
	cluesBeginnerCL,
	cluesEasyCL,
	cluesEliteCL,
	cluesEliteRareCL,
	cluesHardCL,
	cluesHardRareCL,
	cluesMasterCL,
	cluesMasterRareCL,
	cluesMediumCL,
	cluesSharedCL,
	temporossCL,
	wintertodtCL
} from './CollectionsExport';
import { Eatables } from './eatables';

export const superCompostables = [
	'Pineapple',
	'Watermelon',
	'Coconut',
	'Coconut shell',
	'Papaya fruit',
	'Mushroom',
	'Poison ivy berries',
	'Jangerberries',
	'White berries',
	'Snape grass',
	'Toadflax',
	'Avantoe',
	'Kwuarm',
	'Snapdragon',
	'Cadantine',
	'Lantadyme',
	'Dwarf weed',
	'Torstol',
	'Oak roots',
	'Willow roots',
	'Maple roots',
	'Yew roots',
	'Magic roots',
	'Celastrus bark',
	'Calquat fruit',
	'White tree fruit',
	'White lily'
];

export const warmGear = resolveItems([
	'Staff of fire',
	'Fire battlestaff',
	'Lava battlestaff',
	'Steam battlestaff',
	'Smoke battlestaff',
	'Mystic fire staff',
	'Mystic lava staff',
	'Mystic steam staff',
	'Mystic smoke staff',
	'Infernal axe',
	'Infernal pickaxe',
	'Infernal cape',
	'Infernal max cape',
	'Volcanic abyssal whip',
	'Ale of the gods',
	'Bruma torch',
	'Tome of fire',
	'Lit bug lantern',
	'Pyromancer hood',
	'Pyromancer garb',
	'Pyromancer robe',
	'Pyromancer boots',
	'Warm gloves',
	'Fire cape',
	'Firemaking cape(t)',
	'Firemaking cape',
	'Santa hat',
	'Santa mask',
	'Santa jacket',
	'Santa pantaloons',
	'Santa gloves',
	'Santa boots',
	'Antisanta mask',
	'Antisanta jacket',
	'Antisanta pantaloons',
	'Antisanta gloves',
	'Antisanta boots',
	'Bunny top',
	'Bunny legs',
	'Bunny paws',
	'Bunny feet',
	'Obsidian cape',
	'Obsidian cape (r)',
	'Gnome scarf',
	'Jester scarf',
	'Tri-jester scarf',
	'Woolly scarf',
	'Bobble scarf',
	'Rainbow scarf',
	'Clue hunter garb',
	'Clue hunter trousers',
	'Clue hunter gloves',
	'Clue hunter boots',
	'Clue hunter cloak',
	'Chicken head',
	'Chicken wings',
	'Chicken legs',
	'Chicken feet',
	'Polar camo top',
	'Polar camo legs',
	'Wood camo top',
	'Wood camo legs',
	'Jungle camo top',
	'Jungle camo legs',
	'Desert camo top',
	'Desert camo legs',
	'Larupia hat',
	'Larupia top',
	'Larupia legs',
	'Graahk headdress',
	'Graahk top',
	'Graahk legs',
	'Kyatt hat',
	'Kyatt top',
	'Kyatt legs',
	'Bearhead',
	'Lumberjack hat',
	'Fire tiara',
	'Fire max hood',
	'Firemaking hood',
	'Infernal max hood',
	'Black santa hat',
	'Santa hat',
	'Max cape',
	'Gloves of silence',
	'Fremennik gloves',
	'Bomber jacket',
	'Bomber cap'
]) as number[];

const ores = resolveItems([
	'Copper ore',
	'Tin ore',
	'Iron ore',
	'Blurite ore',
	'Silver ore',
	'Coal',
	'Elemental ore',
	'Gold ore',
	'Mithril ore',
	'Lovakite ore',
	'Adamantite ore',
	'Runite ore'
]);

const bars = resolveItems([
	'Bronze bar',
	'Blurite bar',
	'Iron bar',
	'Elemental metal',
	'Steel bar',
	'Primed bar',
	'Primed mind bar',
	'Lovakite bar',
	'Mithril bar',
	'Adamantite bar',
	'Runite bar'
]);

const smithingMisc = resolveItems([
	'Shield left half',
	'Shield right half',
	'Dragon metal shard',
	'Dragon metal slice',
	'Godsword blade',
	'Godsword shards 1 & 2',
	'Godsword shards 1 & 3',
	'Godsword shards 2 & 3',
	'Godsword shard 1',
	'Godsword shard 2',
	'Godsword shard 3',
	'Armadyl hilt',
	'Bandos hilt',
	'Saradomin hilt',
	'Zamorak hilt',
	'Arcane sigil',
	'Spectral sigil',
	'Elysian sigil',
	'Blessed Spirit Shield',
	'Smouldering stone',
	'Dragon metal lump',
	'Draconic visage',
	'Skeletal visage',
	'Wyvern visage'
]);

const gems = resolveItems([
	'Amethyst',
	'Sapphire',
	'Opal',
	'Jade',
	'Red topaz',
	'Emerald',
	'Ruby',
	'Diamond',
	'Dragonstone',
	'Onyx',
	'Zenyte',
	'Zenyte shard'
]);

const craftingItems = Craftables.flatMap(item => item.inputItems.itemIDs);

const craftingItemsSet = [...new Set(craftingItems)];

const smithing = resolveItems([...ores, ...bars, ...smithingMisc]);

const barrows = resolveItems([
	"Ahrim's hood",
	"Ahrim's robetop",
	"Ahrim's robeskirt",
	"Ahrim's staff",
	"Ahrim's armour set",
	"Dharok's helm",
	"Dharok's platebody",
	"Dharok's platelegs",
	"Dharok's greataxe",
	"Dharok's armour set",
	"Guthan's helm",
	"Guthan's platebody",
	"Guthan's chainskirt",
	"Guthan's warspear",
	"Guthan's armour set",
	"Karil's coif",
	"Karil's leathertop",
	"Karil's leatherskirt",
	"Karil's crossbow",
	"Karil's armour set",
	"Torag's helm",
	"Torag's platebody",
	"Torag's platelegs",
	"Torag's hammers",
	"Torag's armour set",
	"Verac's helm",
	"Verac's brassard",
	"Verac's plateskirt",
	"Verac's flail",
	"Verac's armour set",
	'Bolt rack'
]);

const seeds = resolveItems([
	'Pineapple seed',
	'Crystal acorn',
	'Magic seed',
	'Yew seed',
	'Maple seed',
	'Willow seed',
	'Acorn',
	'Dragonfruit tree seed',
	'Palm tree seed',
	'Papaya tree seed',
	'Curry tree seed',
	'Orange tree seed',
	'Banana tree seed',
	'Apple tree seed',
	'Torstol seed',
	'Dwarf weed seed',
	'Lantadyme seed',
	'Cadantine seed',
	'Snapdragon seed',
	'Kwuarm seed',
	'Avantoe seed',
	'Irit seed',
	'Toadflax seed',
	'Ranarr seed',
	'Harralander seed',
	'Tarromin seed',
	'Marrentill seed',
	'Guam seed',
	'Spirit seed',
	'Celastrus seed',
	'Redwood tree seed',
	'Potato cactus seed',
	'Cactus seed',
	'Calquat tree seed',
	'Mahogany seed',
	'Teak seed',
	'Attas seed',
	'Iasor seed',
	'Kronos seed',
	'Hespori seed',
	'Belladonna seed',
	'Mushroom spore',
	'Grape seed',
	'Seaweed spore',
	'Poison ivy seed',
	'Whiteberry seed',
	'Jangerberry seed',
	'Dwellberry seed',
	'Cadavaberry seed',
	'Redberry seed',
	'Wildblood seed',
	'Krandorian seed',
	'Yanillian seed',
	'Jute seed',
	'Asgarnian seed',
	'Hammerstone seed',
	'Barley seed',
	'White lily seed',
	'Limpwurt seed',
	'Woad seed',
	'Nasturtium seed',
	'Rosemary seed',
	'Marigold seed',
	'Snape grass seed',
	'Watermelon seed',
	'Strawberry seed',
	'Sweetcorn seed',
	'Tomato seed',
	'Cabbage seed',
	'Onion seed',
	'Potato seed'
]);

const allPotions = Potions.flatMap(potion => potion.items);
const potions = [...new Set(allPotions)];

const grimyHerbs = Grimy.flatMap(grimy => grimy.inputItems.itemIDs);
const cleanHerbs = Grimy.flatMap(clean => clean.item.id);
const herbs = [...new Set(grimyHerbs), ...new Set(cleanHerbs)];

const unfPots = unfinishedPotions.flatMap(unf => unf.item.id);
const unfPotions = resolveItems(['Vial of water', ...new Set(unfPots)]);

const allSecondaries = PotionsMixable.flatMap(item => item.inputItems.itemIDs).filter(
	item => !potions.includes(item) && !unfPotions.includes(item) && !herbs.includes(item)
);
const secondaries = [...new Set(allSecondaries)];

const herblore = resolveItems([...potions, ...herbs, ...unfPotions, ...secondaries]);

const bones = resolveItems([
	'Bones',
	'Babydragon bones',
	'Bat bones',
	'Big bones',
	'Burnt bones',
	'Chewed bones',
	'Curved bone',
	'Dagannoth bones',
	'Dragon bones',
	'Drake bones',
	'Fayrg bones',
	'Hydra bones',
	'Jogre bones',
	'Lava dragon bones',
	'Long bone',
	'Mangled bones',
	'Monkey bones',
	'Ourg bones',
	'Raurg bones',
	'Shaikahan bones',
	'Superior dragon bones',
	'Wolf bones',
	'Wyrm bones',
	'Wyvern bones',
	'Zogre bones'
]);

const fletchingItemsSet = uniqueArr(Fletchables.flatMap(item => item.inputItems.itemIDs));

const skilling = resolveItems([
	'Rune essence',
	'Pure essence',
	'Ashes',
	'Cactus spine',
	'Crushed nest',
	'Desert goat horn',
	'Limpwurt root',
	'Mort myre fungus',
	'Potato cactus',
	"Red spiders' eggs",
	'Snape grass',
	'White berries',
	"Zulrah's scales",
	'Plank',
	'Oak plank',
	'Teak plank',
	'Mahogany plank',
	'Raw shark',
	'Grapes',
	'Feather',
	...fletchingItemsSet,
	...seeds,
	...bones,
	...gems,
	...bars,
	...ores,
	...herbs,
	...smithingMisc,
	...craftingItemsSet
]);

const godwarsGear = resolveItems([
	'Bandos tassets',
	'Bandos chestplate',
	'Bandos boots',
	'Bandos godsword',
	'Zamorakian spear',
	'Zamorak godsword',
	'Staff of the dead',
	'Steam battlestaff',
	'Saradomin sword',
	'Saradomin godsword',
	'Armadyl crossbow',
	'Armadyl helmet',
	'Armadyl chestplate',
	'Armadyl chainskirt',
	'Armadyl godsword'
]);

const spiritShields = resolveItems([
	'Blessed spirit shield',
	'Spectral spirit shield',
	'Arcane spirit shield',
	'Elysian spirit shield'
]);

const gear = resolveItems([
	'Dragonfire shield',
	'Dragonfire ward',
	'Anti-dragon shield',
	'Dragon warhammer',
	...spiritShields,
	...barrows,
	...godwarsGear
]);

const cluesAndCaskets = resolveItems([
	'Clue scroll (beginner)',
	'Clue scroll (easy)',
	'Clue scroll (medium)',
	'Clue scroll (hard)',
	'Clue scroll (elite)',
	'Clue scroll (master)',
	'Reward casket (beginner)',
	'Reward casket (easy)',
	'Reward casket (medium)',
	'Reward casket (hard)',
	'Reward casket (elite)',
	'Reward casket (master)'
]);

const godwars = resolveItems([
	'Bandos hilt',
	'Pet general graardor',
	'Armadyl hilt',
	"Pet kree'arra",
	'Zamorak hilt',
	"Pet k'ril tsutsaroth",
	"Saradomin's light",
	'Saradomin hilt',
	'Pet zilyana',
	'Godsword shard 1',
	'Godsword shard 2',
	'Godsword shard 3',
	'Godsword blade',
	'Armadyl godsword (or)',
	'Bandos godsword (or)',
	'Zamorak godsword (or)',
	'Saradomin godsword (or)',
	...godwarsGear
]);

const dagannothkings = resolveItems([
	'Berserker ring',
	'Warrior ring',
	'Archers ring',
	'Seers ring',
	'Dragon axe',
	'Fremennik helm',
	'Fremennik blade',
	'Fremennik shield',
	'Rock-shell helm',
	'Rock-shell plate',
	'Rock-shell legs',
	'Rock-shell boots',
	'Rock-shell gloves',
	'Berserker helm',
	'Warrior helm',
	'Farseer helm',
	'Pet dagannoth rex',
	'Seercull',
	'Spined helm',
	'Spined body',
	'Spined chaps',
	'Spined boots',
	'Spined gloves',
	'Archer helm',
	'Pet dagannoth supreme',
	'Skeletal helm',
	'Skeletal top',
	'Skeletal bottoms',
	'Skeletal boots',
	'Skeletal gloves',
	'Mud battlestaff',
	'Pet dagannoth prime'
]);

const cerberus = resolveItems([
	'Primordial crystal',
	'Pegasian crystal',
	'Eternal crystal',
	'Smouldering stone',
	'Key master teleport',
	'Jar of souls',
	'Hellpuppy'
]);

const zulrah = resolveItems([
	"Zulrah's scales",
	'Tanzanite mutagen',
	'Magma mutagen',
	'Tanzanite fang',
	'Magic fang',
	'Serpentine visage',
	'Uncut onyx',
	'Onyx',
	'Zul-andra teleport',
	'Jar of swamp',
	'Pet snakeling',
	'Tanzanite helm',
	'Magma helm',
	'Toxic staff (uncharged)',
	'Toxic staff of the dead',
	'Toxic blowpipe',
	'Toxic blowpipe (empty)',
	'Uncharged toxic trident',
	'Trident of the swamp',
	'Serpentine helm (uncharged)',
	'Serpentine helm'
]);

const corporealBeast = resolveItems([
	'Spectral sigil',
	'Arcane sigil',
	'Elysian sigil',
	'Spirit shield',
	'Holy elixir',
	'Pet dark core',
	'Onyx bolts (e)',
	...spiritShields
]);

const kalphitequeen = resolveItems([
	'Dragon chainbody',
	'Dragon 2h sword',
	'Kq head',
	'Jar of sand',
	'Kalphite princess'
]);

const vorkath = resolveItems([
	'Superior dragon bones',
	"Vorkath's head",
	'Wrath talisman',
	'Dragonbone necklace',
	'Jar of decay',
	'Vorki',
	'Draconic visage',
	'Skeletal visage'
]);

const agility = resolveItems([...gracefulItems, 'Mark of grace', 'Amylase crystal']);

const prayer = resolveItems([
	'Ensouled goblin head',
	'Ensouled monkey head',
	'Ensouled imp head',
	'Ensouled minotaur head',
	'Ensouled scorpion head',
	'Ensouled bear head',
	'Ensouled unicorn head',
	'Ensouled dog head',
	'Ensouled chaos druid head',
	'Ensouled giant head',
	'Ensouled ogre head',
	'Ensouled elf head',
	'Ensouled troll head',
	'Ensouled horror head',
	'Ensouled kalphite head',
	'Ensouled dagannoth head',
	'Ensouled bloodveld head',
	'Ensouled tzhaar head',
	'Ensouled demon head',
	'Ensouled aviansie head',
	'Ensouled abyssal head',
	'Ensouled dragon head',
	'Fiendish ashes',
	'Vile ashes',
	'Malicious ashes',
	'Abyssal ashes',
	'Infernal ashes',
	...bones
]);

const diango = resolveItems([
	'Hornwood helm',
	'Hand fan',
	'Mask of balance',
	'Druidic wreath',
	'Disk of returning',
	'Tiger toy',
	'Lion toy',
	'Snow leopard toy',
	'Amur leopard toy',
	'Holy handegg',
	'Peaceful handegg',
	'Chaotic handegg',
	'Rainbow scarf',
	"Diango's claws",
	'Goblin paint cannon',
	'Green banner',
	'Spinning plate',
	'Brown toy horsey',
	'White toy horsey',
	'Black toy horsey',
	'Grey toy horsey',
	11_705,
	11_706
]);

const diaries = resolveItems([
	'Karamja gloves 1',
	'Karamja gloves 2',
	'Karamja gloves 3',
	'Karamja gloves 4',
	'Ardougne cloak 1',
	'Ardougne cloak 2',
	'Ardougne cloak 3',
	'Ardougne cloak 4',
	'Falador shield 1',
	'Falador shield 2',
	'Falador shield 3',
	'Falador shield 4',
	'Fremennik sea boots 1',
	'Fremennik sea boots 2',
	'Fremennik sea boots 3',
	'Fremennik sea boots 4',
	'Kandarin headgear 1',
	'Kandarin headgear 2',
	'Kandarin headgear 3',
	'Kandarin headgear 4',
	'Desert amulet 1',
	'Desert amulet 2',
	'Desert amulet 3',
	'Desert amulet 4',
	"Explorer's ring 1",
	"Explorer's ring 2",
	"Explorer's ring 3",
	"Explorer's ring 4",
	'Morytania legs 1',
	'Morytania legs 2',
	'Morytania legs 3',
	'Morytania legs 4',
	'Varrock armour 1',
	'Varrock armour 2',
	'Varrock armour 3',
	'Varrock armour 4',
	'Wilderness sword 1',
	'Wilderness sword 2',
	'Wilderness sword 3',
	'Wilderness sword 4',
	'Western banner 1',
	'Western banner 2',
	'Western banner 3',
	'Western banner 4',
	"Rada's blessing 1",
	"Rada's blessing 2",
	"Rada's blessing 3",
	"Rada's blessing 4",
	'Antique lamp 1',
	'Antique lamp 2',
	'Antique lamp 3',
	'Antique lamp 4'
]);

const food = resolveItems(Eatables.map(food => food.name));

interface Filterable {
	name: string;
	aliases: string[];
	items: (user?: MUser) => number[];
}

export const baseFilters: Filterable[] = [
	{
		name: 'Smithing',
		aliases: ['smithing', 'smith', 'sm'],
		items: () => smithing
	},
	{
		name: 'Diango',
		aliases: ['diango', 'daily', 'dailies'],
		items: () => diango
	},
	{
		name: 'Diaries',
		aliases: ['diaries', 'diary', 'ad'],
		items: () => diaries
	},
	{
		name: 'Crafting',
		aliases: ['crafting', 'craft', 'cr'],
		items: () => craftingItemsSet
	},
	{
		name: 'Barrows',
		aliases: ['barrows', 'br'],
		items: () => barrows
	},
	{
		name: 'Skilling',
		aliases: ['skilling', 'skill'],
		items: () => skilling
	},
	{
		name: 'Gear',
		aliases: ['gear', 'gr'],
		items: () => gear
	},
	{
		name: 'Clues and Caskets',
		aliases: ['clues and caskets', 'clues', 'caskets', 'cl', 'clue', 'casket', 'tt'],
		items: () => cluesAndCaskets
	},
	{
		name: 'God wars',
		aliases: ['god wars', 'gwd', 'godwars', 'gw'],
		items: () => godwars
	},
	{
		name: 'Dagannoth kings',
		aliases: ['dagannoth kings', 'dks', 'dk', 'dagannoth', 'kings'],
		items: () => dagannothkings
	},
	{
		name: 'Cerberus',
		aliases: ['cerb', 'ce', 'cerberus'],
		items: () => cerberus
	},
	{
		name: 'Zulrah',
		aliases: ['zul', 'zulr', 'zulrah'],
		items: () => zulrah
	},
	{
		name: 'Corporeal beast',
		aliases: ['corporeal beast', 'corp', 'co', 'corporeal'],
		items: () => corporealBeast
	},
	{
		name: 'Kalphite queen',
		aliases: ['kalphite queen', 'kq', 'ka', 'kalphite', 'queen'],
		items: () => kalphitequeen
	},
	{
		name: 'Vorkath',
		aliases: ['vorkath', 'vork'],
		items: () => vorkath
	},
	{
		name: 'Farming',
		aliases: ['farming', 'farm', 'seeds'],
		items: () => [
			...resolveItems(['Compost', 'Supercompost', 'Ultracompost', 'Bottomless compost bucket ']),
			...seeds
		]
	},
	{
		name: 'Compost',
		aliases: ['compost', 'compostables'],
		items: () => [...resolveItems(['Compost', 'Supercompost', 'Ultracompost']), ...resolveItems(superCompostables)]
	},
	{
		name: 'Fletching',
		aliases: ['fletching', 'fletch'],
		items: () => fletchingItemsSet
	},
	{
		name: 'Agility',
		aliases: ['agility', 'agi'],
		items: () => agility
	},
	{
		name: 'Prayer',
		aliases: ['prayer', 'pray'],
		items: () => prayer
	},
	{
		name: 'Herblore',
		aliases: ['herblore'],
		items: () => herblore
	},
	{
		name: 'Herbs',
		aliases: ['herbs', 'grimy', 'clean'],
		items: () => herbs
	},
	{
		name: 'Unfinished potions',
		aliases: ['unf', 'unfinished'],
		items: () => unfPotions
	},
	{
		name: 'Secondaries',
		aliases: ['seconds', 'secondary', 'secondaries'],
		items: () => secondaries
	},
	{
		name: 'Potions',
		aliases: ['potions', 'pots'],
		items: () => potions
	},
	{
		name: 'Food',
		aliases: ['food'],
		items: () => food
	},
	{
		name: 'Wintertodt',
		aliases: ['wintertodt', 'todt', 'wt'],
		items: () => wintertodtCL
	},
	{
		name: 'Warm gear',
		aliases: ['warm gear', 'warm'],
		items: () => warmGear
	},
	{
		name: 'Tempoross',
		aliases: ['temp', 'ross', 'tempo', 'tempoross'],
		items: () => temporossCL
	},
	{
		name: 'Beginner Clues',
		aliases: ['clues beginner', 'beginner clues', 'clue beginner', 'beginner clue'],
		items: () => cluesBeginnerCL
	},
	{
		name: 'Easy Clues',
		aliases: ['clues easy', 'easy clues', 'clue easy', 'easy clue'],
		items: () => cluesEasyCL
	},
	{
		name: 'Medium Clues',
		aliases: ['clues medium', 'medium clues', 'clue medium', 'medium clue'],
		items: () => cluesMediumCL
	},
	{
		name: 'Hard Clues',
		aliases: ['clues hard', 'hard clues', 'clue hard', 'hard clue'],
		items: () => cluesHardCL
	},
	{
		name: 'Elite Clues',
		aliases: ['clues elite', 'elite clues', 'clue elite', 'elite clue'],
		items: () => cluesEliteCL
	},
	{
		name: 'Master Clues',
		aliases: ['clues master', 'master clues', 'clue master', 'master clue'],
		items: () => cluesMasterCL
	},
	{
		name: 'All Clues',
		aliases: ['clues all', 'all clues', 'clue all', 'all clue'],
		items: () => allClueItems
	},
	{
		name: 'Clues Shared',
		aliases: ['clues shared', 'shared clues', 'clue shared', 'shared clue'],
		items: () => cluesSharedCL
	},
	{
		name: 'Clues Rares',
		aliases: ['clues rares', 'clues rare', 'rare clues', 'clue rare', 'rare clue'],
		items: () => [...new Set([...cluesHardRareCL, ...cluesEliteRareCL, ...cluesMasterRareCL])]
	},
	{
		name: 'Lamps',
		aliases: ['lamps'],
		items: () => Lampables.flatMap(i => i.items)
	},
	{
		name: 'Openables',
		aliases: ['opens'],
		items: () => allOpenables.map(i => i.id)
	},
	{
		name: 'Favourite Alchs',
		aliases: ['favourite alchs', 'favalchs'],
		items: user => {
			if (!user) return [];

			return user.user.favorite_alchables;
		}
	}
];

export const filterableTypes = [...baseFilters];

for (const clGroup of Object.values(allCollectionLogs).map(c => c.activities)) {
	for (const [name, cl] of Object.entries(clGroup)) {
		const aliasesForThisCL: string[] = [name, ...(cl.alias ?? [])].map(i => i.toLowerCase());
		const already = filterableTypes.some(t => [...t.aliases, t.name].some(i => aliasesForThisCL.includes(i)));
		if (!already) {
			filterableTypes.push({
				name,
				aliases: aliasesForThisCL,
				items: () => cl.items
			});
		}
	}
}
