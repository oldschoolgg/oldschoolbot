import { BeginnerClueTable } from 'oldschooljs/dist/simulation/clues/Beginner';
import { EasyClueTable } from 'oldschooljs/dist/simulation/clues/Easy';
import { EliteClueTable } from 'oldschooljs/dist/simulation/clues/Elite';
import { HardClueTable } from 'oldschooljs/dist/simulation/clues/Hard';
import { MasterClueTable } from 'oldschooljs/dist/simulation/clues/Master';
import { MediumClueTable } from 'oldschooljs/dist/simulation/clues/Medium';
import LootTable from 'oldschooljs/dist/structures/LootTable';

import { superCompostables } from '../../commands/Minion/compostbin';
import { customItems } from '../customItems/util';
import { monkeyEatables } from '../monkeyRumble';
import { GrandmasterClueTable } from '../simulation/grandmasterClue';
import { gracefulItems } from '../skilling/skills/agility';
import { Craftables } from '../skilling/skills/crafting/craftables';
import { Fletchables } from '../skilling/skills/fletching/fletchables';
import resolveItems from '../util/resolveItems';
import { XPLamps } from '../xpLamps';
import { allCollectionLogs } from './Collections';
import {
	allClueItems,
	allPetIDs,
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
import Openables, { tmbTable, umbTable } from './openables';

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

const craftingItems = Craftables.flatMap(item => Object.keys(item.inputItems.bank).map(key => parseInt(key)));

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
	'Potato seed',
	'Mysterious seed',
	'Athelas seed',
	'Avocado seed',
	'Lychee seed',
	'Mango seed'
]);

const herbs = resolveItems([
	'Grimy guam leaf',
	'Grimy marrentill',
	'Grimy tarromin',
	'Grimy harralander',
	'Grimy ranarr weed',
	'Grimy irit leaf',
	'Grimy avantoe',
	'Grimy kwuarm',
	'Grimy cadantine',
	'Grimy dwarf weed',
	'Grimy torstol',
	'Grimy lantadyme',
	'Grimy toadflax',
	'Grimy snapdragon',
	'Guam leaf',
	'Marrentill',
	'Tarromin',
	'Harralander',
	'Ranarr weed',
	'Toadflax',
	'Irit leaf',
	'Avantoe',
	'Kwuarm',
	'Snapdragon',
	'Cadantine',
	'Lantadyme',
	'Dwarf weed',
	'Torstol',
	'Athelas'
]);

const secondaries = resolveItems([
	'Eye of newt',
	'Unicorn horn dust',
	'Snake weed',
	'Limpwurt root',
	'Ashes',
	'Volcanic Ash',
	"Red spiders' eggs",
	'Chocolate dust',
	'White berries',
	"Toad's legs",
	'Goat horn dust',
	'Snape grass',
	'Mort myre fungus',
	'Kebbit teeth dust',
	'Gorak claw powder',
	'Dragon scale dust',
	'Yew roots',
	'Wine of zamorak',
	'Potato cactus',
	'Jangerberries',
	'Magic roots',
	'Crushed nest',
	'Poison ivy berries',
	"Zulrah's scales",
	'Torstol',
	'Crushed superior dragon bones',
	'Amylase crystal'
]);

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
	'Zogre bones',
	'Abyssal dragon bones'
]);

const fletchingItems = Fletchables.flatMap(item => Object.keys(item.inputItems.bank).map(key => parseInt(key)));

const fletchingItemsSet = [...new Set(fletchingItems)];

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
	'Elysian spirit shield',
	'Divine spirit shield'
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
	'Clue scroll (grandmaster)',
	'Reward casket (beginner)',
	'Reward casket (easy)',
	'Reward casket (medium)',
	'Reward casket (hard)',
	'Reward casket (elite)',
	'Reward casket (master)',
	'Reward casket (grandmaster)'
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
	'Divine sigil',
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

const potions = resolveItems([
	'Attack potion(1)',
	'Attack potion(2)',
	'Attack potion(3)',
	'Attack potion(4)',
	'Antipoison(1)',
	'Antipoison(2)',
	'Antipoison(3)',
	'Antipoison(4)',
	'Strength potion(1)',
	'Strength potion(2)',
	'Strength potion(3)',
	'Strength potion(4)',
	'Compost potion(1)',
	'Compost potion(2)',
	'Compost potion(3)',
	'Compost potion(4)',
	'Restore potion(1)',
	'Restore potion(2)',
	'Restore potion(3)',
	'Restore potion(4)',
	'Energy potion(1)',
	'Energy potion(2)',
	'Energy potion(3)',
	'Energy potion(4)',
	'Defence potion(1)',
	'Defence potion(2)',
	'Defence potion(3)',
	'Defence potion(4)',
	'Agility potion(1)',
	'Agility potion(2)',
	'Agility potion(3)',
	'Agility potion(4)',
	'Combat potion(1)',
	'Combat potion(2)',
	'Combat potion(3)',
	'Combat potion(4)',
	'Prayer potion(1)',
	'Prayer potion(2)',
	'Prayer potion(3)',
	'Prayer potion(4)',
	'Super attack(1)',
	'Super attack(2)',
	'Super attack(3)',
	'Super attack(4)',
	'Superantipoison(1)',
	'Superantipoison(2)',
	'Superantipoison(3)',
	'Superantipoison(4)',
	'Fishing potion(1)',
	'Fishing potion(2)',
	'Fishing potion(3)',
	'Fishing potion(4)',
	'Super energy(1)',
	'Super energy(2)',
	'Super energy(3)',
	'Super energy(4)',
	'Hunter potion(1)',
	'Hunter potion(2)',
	'Hunter potion(3)',
	'Hunter potion(4)',
	'Super strength(1)',
	'Super strength(2)',
	'Super strength(3)',
	'Super strength(4)',
	'Super restore (1)',
	'Super restore (2)',
	'Super restore (3)',
	'Super restore(4)',
	'Sanfew serum(1)',
	'Sanfew serum(2)',
	'Sanfew serum(3)',
	'Sanfew serum(4)',
	'Super defence(1)',
	'Super defence(2)',
	'Super defence(3)',
	'Super defence(4)',
	'Antidote+(1)',
	'Antidote+(2)',
	'Antidote+(3)',
	'Antidote+(4)',
	'Antifire potion(1)',
	'Antifire potion(2)',
	'Antifire potion(3)',
	'Antifire potion(4)',
	'Ranging potion(1)',
	'Ranging potion(2)',
	'Ranging potion(3)',
	'Ranging potion(4)',
	'Magic potion(1)',
	'Magic potion(2)',
	'Magic potion(3)',
	'Magic potion(4)',
	'Stamina potion(1)',
	'Stamina potion(2)',
	'Stamina potion(3)',
	'Stamina potion(4)',
	'Zamorak brew(1)',
	'Zamorak brew(2)',
	'Zamorak brew(3)',
	'Zamorak brew(4)',
	'Antidote++(1)',
	'Antidote++(2)',
	'Antidote++(3)',
	'Antidote++(4)',
	'Saradomin brew(1)',
	'Saradomin brew(2)',
	'Saradomin brew(3)',
	'Saradomin brew(4)',
	'Extended antifire(1)',
	'Extended antifire(2)',
	'Extended antifire(3)',
	'Extended antifire(4)',
	'Anti-venom(1)',
	'Anti-venom(2)',
	'Anti-venom(3)',
	'Anti-venom(4)',
	'Super combat potion(1)',
	'Super combat potion(2)',
	'Super combat potion(3)',
	'Super combat potion(4)',
	'Super antifire potion(1)',
	'Super antifire potion(2)',
	'Super antifire potion(3)',
	'Super antifire potion(4)',
	'Anti-venom+(1)',
	'Anti-venom+(2)',
	'Anti-venom+(3)',
	'Anti-venom+(4)',
	'Extended super antifire(1)',
	'Extended super antifire(2)',
	'Extended super antifire(3)',
	'Extended super antifire(4)'
]);

const herblore = resolveItems([
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
	'Avantoe potion (unf)',
	'Cadantine potion (unf)',
	'Dwarf weed potion (unf)',
	'Guam potion (unf)',
	'Harralander potion (unf)',
	'Irit potion (unf)',
	'Kwuarm potion (unf)',
	'Lantadyme potion (unf)',
	'Marrentill potion (unf)',
	'Ranarr potion (unf)',
	'Snapdragon potion (unf)',
	'Tarromin potion (unf)',
	'Toadflax potion (unf)',
	'Torstol potion (unf)',
	'Vial of water',
	'Eye of newt',
	'Unicorn horn dust',
	'Volcanic ash',
	'Chocolate dust',
	"Toad's legs",
	'Dragon scale dust',
	'Wine of zamorak',
	'Amylase crystal',
	'Jangerberries',
	'Poison ivy berries',
	"Zulrah's scales",
	'Crushed superior dragon bones',
	...potions,
	...herbs
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
	'Event rpg',
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
	items: number[];
}

export const baseFilters: Filterable[] = [
	{
		name: 'Smithing',
		aliases: ['smithing', 'smith', 'sm'],
		items: smithing
	},
	{
		name: 'Diango',
		aliases: ['diango', 'daily', 'dailies'],
		items: diango
	},
	{
		name: 'Diaries',
		aliases: ['diaries', 'diary', 'ad'],
		items: diaries
	},
	{
		name: 'Crafting',
		aliases: ['crafting', 'craft', 'cr'],
		items: craftingItemsSet
	},
	{
		name: 'Barrows',
		aliases: ['barrows', 'br'],
		items: barrows
	},
	{
		name: 'Skilling',
		aliases: ['skilling', 'skill'],
		items: skilling
	},
	{
		name: 'Gear',
		aliases: ['gear', 'gr'],
		items: gear
	},
	{
		name: 'Clues and Caskets',
		aliases: ['clues and caskets', 'clues', 'caskets', 'cl', 'clue', 'casket', 'tt'],
		items: cluesAndCaskets
	},
	{
		name: 'God wars',
		aliases: ['god wars', 'gwd', 'godwars', 'gw'],
		items: godwars
	},
	{
		name: 'Dagannoth kings',
		aliases: ['dagannoth kings', 'dks', 'dk', 'dagannoth', 'kings'],
		items: dagannothkings
	},
	{
		name: 'Cerberus',
		aliases: ['cerb', 'ce', 'cerberus'],
		items: cerberus
	},
	{
		name: 'Zulrah',
		aliases: ['zul', 'zulr', 'zulrah'],
		items: zulrah
	},
	{
		name: 'Corporeal beast',
		aliases: ['corporeal beast', 'corp', 'co', 'corporeal'],
		items: corporealBeast
	},
	{
		name: 'Kalphite queen',
		aliases: ['kalphite queen', 'kq', 'ka', 'kalphite', 'queen'],
		items: kalphitequeen
	},
	{
		name: 'Vorkath',
		aliases: ['vorkath', 'vork'],
		items: vorkath
	},
	{
		name: 'Farming',
		aliases: ['farming', 'farm', 'seeds'],
		items: [...resolveItems(['Compost', 'Supercompost', 'Ultracompost', 'Bottomless compost bucket ']), ...seeds]
	},
	{
		name: 'Compost',
		aliases: ['compost', 'compostables'],
		items: [...resolveItems(['Compost', 'Supercompost', 'Ultracompost']), ...resolveItems(superCompostables)]
	},
	{
		name: 'Herblore',
		aliases: ['herblore'],
		items: herblore
	},
	{
		name: 'Fletching',
		aliases: ['fletching', 'fletch'],
		items: fletchingItemsSet
	},
	{
		name: 'Agility',
		aliases: ['agility', 'agi'],
		items: agility
	},
	{
		name: 'Prayer',
		aliases: ['prayer', 'pray'],
		items: prayer
	},
	{
		name: 'Potions',
		aliases: ['potions', 'pots'],
		items: potions
	},
	{
		name: 'Herbs',
		aliases: ['herbs'],
		items: herbs
	},
	{
		name: 'Secondaries',
		aliases: ['seconds', 'secondary', 'secondaries'],
		items: secondaries
	},
	{
		name: 'Food',
		aliases: ['food'],
		items: food
	},
	{
		name: 'Wintertodt',
		aliases: ['wintertodt', 'todt', 'wt'],
		items: wintertodtCL
	},
	{
		name: 'Warm gear',
		aliases: ['warm gear', 'warm'],
		items: warmGear
	},
	{
		name: 'Tempoross',
		aliases: ['temp', 'ross', 'tempo', 'tempoross'],
		items: temporossCL
	},
	{
		name: 'Beginner Clues',
		aliases: ['clues beginner', 'beginner clues', 'clue beginner', 'beginner clue'],
		items: cluesBeginnerCL
	},
	{
		name: 'Easy Clues',
		aliases: ['clues easy', 'easy clues', 'clue easy', 'easy clue'],
		items: cluesEasyCL
	},
	{
		name: 'Medium Clues',
		aliases: ['clues medium', 'medium clues', 'clue medium', 'medium clue'],
		items: cluesMediumCL
	},
	{
		name: 'Hard Clues',
		aliases: ['clues hard', 'hard clues', 'clue hard', 'hard clue'],
		items: cluesHardCL
	},
	{
		name: 'Elite Clues',
		aliases: ['clues elite', 'elite clues', 'clue elite', 'elite clue'],
		items: cluesEliteCL
	},
	{
		name: 'Master Clues',
		aliases: ['clues master', 'master clues', 'clue master', 'master clue'],
		items: cluesMasterCL
	},
	{
		name: 'All Clues',
		aliases: ['clues all', 'all clues', 'clue all', 'all clue'],
		items: allClueItems
	},
	{
		name: 'Clues Shared',
		aliases: ['clues shared', 'shared clues', 'clue shared', 'shared clue'],
		items: cluesSharedCL
	},
	{
		name: 'Clues Rares',
		aliases: ['clues rares', 'clues rare', 'rare clues', 'clue rare', 'rare clue'],
		items: [...new Set([...cluesHardRareCL, ...cluesEliteRareCL, ...cluesMasterRareCL])]
	},
	{
		name: 'umb',
		aliases: ['umb'],
		items: umbTable
	},
	{
		name: 'tmb',
		aliases: ['tmb'],
		items: tmbTable
	},
	{
		name: 'Pets',
		aliases: ['pets', 'pmb'],
		items: allPetIDs.flat(Infinity) as number[]
	},
	{
		name: 'Holiday',
		aliases: ['holiday', 'hmb', 'rare', 'rares'],
		items: [
			...(Openables.find(o => o.name === 'Holiday Mystery box')!.table as LootTable).allItems,
			...(Openables.find(o => o.name === 'Christmas cracker')!.table as LootTable).allItems
		]
	},
	{
		name: 'Custom Items',
		aliases: ['custom', 'custom items'],
		items: customItems
	},
	{
		name: 'Beginner rewards',
		aliases: ['beginnerrewards'],
		items: BeginnerClueTable.allItems
	},
	{
		name: 'Easy rewards',
		aliases: ['easyrewards'],
		items: EasyClueTable.allItems
	},
	{
		name: 'Medium rewards',
		aliases: ['mediumrewards'],
		items: MediumClueTable.allItems
	},
	{
		name: 'Hard rewards',
		aliases: ['hardrewards'],
		items: HardClueTable.allItems
	},
	{
		name: 'Elite rewards',
		aliases: ['eliterewards'],
		items: EliteClueTable.allItems
	},
	{
		name: 'Master rewards',
		aliases: ['masterrewards'],
		items: MasterClueTable.allItems
	},
	{
		name: 'Grandmaster rewards',
		aliases: ['grandmasterrewards'],
		items: GrandmasterClueTable.allItems
	},
	{
		name: 'Fruit',
		aliases: ['fruit'],
		items: monkeyEatables.map(i => i.item.id)
	},
	{
		name: 'Lamps',
		aliases: ['lamps'],
		items: XPLamps.map(i => i.itemID)
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
				items: cl.items
			});
		}
	}
}
