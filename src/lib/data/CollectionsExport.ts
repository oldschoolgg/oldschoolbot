import type { Minigame } from '@prisma/client';
import { objectEntries } from 'e';
import type { Bank, Item } from 'oldschooljs';

import { resolveItems } from 'oldschooljs/dist/util/util';
import { growablePets } from '../growablePets';
import { implings } from '../implings';
import type { MinigameScore } from '../settings/minigames';
import type { MUserStats } from '../structures/MUserStats';
import getOSItem from '../util/getOSItem';
import {
	gracefulCapes,
	gracefulFeet,
	gracefulHands,
	gracefulHoods,
	gracefulLegs,
	gracefulTops
} from './gracefulVariants';

export interface IToReturnCollection {
	category: string;
	name: string;
	collection: number[];
	completions?: Record<string, number>;
	isActivity?: boolean;
	collectionObtained: number;
	collectionTotal: number;
	leftList?: ILeftListStatus;
	userItems: Bank;
	counts: boolean;
}

export interface ILeftListStatus {
	[key: string]: 'not_started' | 'started' | 'completed';
}

export interface IKCActivity {
	[key: string]:
		| string
		| string[]
		| ((user: MUser, minigameScores: MinigameScore[], stats: MUserStats) => Promise<number>);
}

export type FormatProgressFunction = ({
	getKC,
	minigames,
	user,
	stats
}: {
	user: MUser;
	getKC: (id: number) => Promise<number>;
	minigames: Minigame;
	stats: MUserStats;
}) => string | string[] | Promise<string | string[]>;

interface ICollectionActivity {
	[key: string]: {
		// If the collection will count towards the collection log counter
		counts?: false;
		alias?: string[];
		items: number[];
		allItems?: number[];
		kcActivity?: string | IKCActivity;
		isActivity?: boolean;
		fmtProg?: FormatProgressFunction;
	};
}

export interface ICollection {
	[key: string]: {
		alias?: string[];
		activities: ICollectionActivity;
	};
}

export const boaters = resolveItems([
	'Red boater',
	'Green boater',
	'Orange boater',
	'Black boater',
	'Blue boater',
	'Pink boater',
	'Purple boater',
	'White boater'
]);

export const godBooks = resolveItems([
	'Holy book',
	'Unholy book',
	'Book of balance',
	'Book of war',
	'Book of law',
	'Book of darkness'
]);

export const mitres = resolveItems([
	'Saradomin mitre',
	'Guthix mitre',
	'Zamorak mitre',
	'Armadyl mitre',
	'Bandos mitre',
	'Ancient mitre'
]);

export const bobShirts = resolveItems([
	"Bob's black shirt",
	"Bob's blue shirt",
	"Bob's green shirt",
	"Bob's purple shirt",
	"Bob's red shirt"
]);

export const croziers = resolveItems([
	'Saradomin crozier',
	'Guthix crozier',
	'Zamorak crozier',
	'Armadyl crozier',
	'Bandos crozier',
	'Ancient crozier'
]);

export const headbands = resolveItems([
	'Red headband',
	'Black headband',
	'Brown headband',
	'White headband',
	'Blue headband',
	'Gold headband',
	'Pink headband',
	'Green headband'
]);

export const stoles = resolveItems([
	'Saradomin stole',
	'Guthix stole',
	'Zamorak stole',
	'Armadyl stole',
	'Bandos stole',
	'Ancient stole'
]);

export const runeHeraldicShields = resolveItems([
	'Rune shield (h1)',
	'Rune shield (h2)',
	'Rune shield (h3)',
	'Rune shield (h4)',
	'Rune shield (h5)'
]);

export const runeHeraldicHelms = resolveItems([
	'Rune helm (h1)',
	'Rune helm (h2)',
	'Rune helm (h3)',
	'Rune helm (h4)',
	'Rune helm (h5)'
]);

export const abyssalSireCL = resolveItems([
	'Abyssal orphan',
	'Unsired',
	'Abyssal head',
	'Bludgeon spine',
	'Bludgeon claw',
	'Bludgeon axon',
	'Jar of miasma',
	'Abyssal dagger',
	'Abyssal whip'
]);
export const alchemicalHydraCL = resolveItems([
	'Ikkle hydra',
	"Hydra's claw",
	'Hydra tail',
	'Hydra leather',
	"Hydra's fang",
	"Hydra's eye",
	"Hydra's heart",
	'Dragon knife',
	'Dragon thrownaxe',
	'Jar of chemicals',
	'Alchemical hydra heads'
]);

const karilsItems = resolveItems(["Karil's coif", "Karil's leathertop", "Karil's leatherskirt", "Karil's crossbow"]);
const ahrimsItems = resolveItems(["Ahrim's hood", "Ahrim's robetop", "Ahrim's robeskirt", "Ahrim's staff"]);
const dharokItems = resolveItems(["Dharok's helm", "Dharok's platebody", "Dharok's platelegs", "Dharok's greataxe"]);
const guthansItems = resolveItems(["Guthan's helm", "Guthan's platebody", "Guthan's chainskirt", "Guthan's warspear"]);
const toragsItems = resolveItems(["Torag's helm", "Torag's platebody", "Torag's platelegs", "Torag's hammers"]);
const veracsItems = resolveItems(["Verac's helm", "Verac's brassard", "Verac's plateskirt", "Verac's flail"]);
export const barrowsItemArr = [karilsItems, ahrimsItems, guthansItems, toragsItems, veracsItems, dharokItems];
export const barrowsChestCL = resolveItems([
	...karilsItems,
	...ahrimsItems,
	...dharokItems,
	...guthansItems,
	...toragsItems,
	...veracsItems,
	'Bolt rack'
]);
export const bryophytaCL = resolveItems(["Bryophyta's essence"]);
export const callistoCL = resolveItems([
	'Callisto cub',
	'Tyrannical ring',
	'Dragon pickaxe',
	'Dragon 2h sword',
	'Claws of callisto',
	'Voidwaker hilt'
]);
export const cerberusCL = resolveItems([
	'Hellpuppy',
	'Eternal crystal',
	'Pegasian crystal',
	'Primordial crystal',
	'Jar of souls',
	'Smouldering stone',
	'Key master teleport'
]);
export const chaosElementalCL = resolveItems(['Pet chaos elemental', 'Dragon pickaxe', 'Dragon 2h sword']);
export const chaosFanaticCL = resolveItems(['Pet chaos elemental', 'Odium shard 1', 'Malediction shard 1']);

const godWarsDungeonGodswordShards = resolveItems(['Godsword shard 1', 'Godsword shard 2', 'Godsword shard 3']);
export const generalGraardorCL = resolveItems([
	'Pet general graardor',
	'Bandos chestplate',
	'Bandos tassets',
	'Bandos boots',
	'Bandos hilt',
	...godWarsDungeonGodswordShards
]);
export const kreeArraCL = resolveItems([
	"Pet kree'arra",
	'Armadyl helmet',
	'Armadyl chestplate',
	'Armadyl chainskirt',
	'Armadyl hilt',
	...godWarsDungeonGodswordShards
]);
export const krilTsutsarothCL = resolveItems([
	"Pet k'ril tsutsaroth",
	'Staff of the dead',
	'Zamorakian spear',
	'Steam battlestaff',
	'Zamorak hilt',
	...godWarsDungeonGodswordShards
]);
export const commanderZilyanaCL = resolveItems([
	'Pet zilyana',
	'Armadyl crossbow',
	'Saradomin hilt',
	'Saradomin sword',
	"Saradomin's light",
	...godWarsDungeonGodswordShards
]);

export const corporealBeastCL = resolveItems([
	'Pet dark core',
	'Elysian sigil',
	'Spectral sigil',
	'Arcane sigil',
	'Holy elixir',
	'Spirit shield',
	'Jar of spirits'
]);
export const muspahCL = resolveItems([
	'Muphin',
	'Venator shard',
	'Ancient icon',
	'Charged ice',
	'Frozen cache',
	'Ancient essence'
]);
export const crazyArchaeologistCL = resolveItems(['Odium shard 2', 'Malediction shard 2', 'Fedora']);
export const dagannothKingsCL = resolveItems([
	'Pet dagannoth prime',
	'Pet dagannoth supreme',
	'Pet dagannoth rex',
	'Berserker ring',
	'Archers ring',
	'Seers ring',
	'Warrior ring',
	'Dragon axe',
	'Seercull',
	'Mud battlestaff'
]);
export const fightCavesCL = resolveItems(['Tzrek-jad', 'Fire cape']);
export const theGauntletCL = resolveItems([
	'Youngllef',
	'Crystal armour seed',
	'Crystal weapon seed',
	'Enhanced crystal weapon seed',
	'Gauntlet cape'
]);
export const giantMoleCL = resolveItems(['Baby mole', 'Mole skin', 'Mole claw']);
export const godWarsDungeonCL = resolveItems([
	'Pet zilyana',
	'Armadyl crossbow',
	'Saradomin hilt',
	'Saradomin sword',
	"Saradomin's light",
	"Pet k'ril tsutsaroth",
	'Staff of the dead',
	'Zamorakian spear',
	'Steam battlestaff',
	'Zamorak hilt',
	"Pet kree'arra",
	'Armadyl helmet',
	'Armadyl chestplate',
	'Armadyl chainskirt',
	'Armadyl hilt',
	'Pet general graardor',
	'Bandos chestplate',
	'Bandos tassets',
	'Bandos boots',
	'Bandos hilt',
	...godWarsDungeonGodswordShards,
	'Frozen key piece (bandos)',
	'Frozen key piece (saradomin)',
	'Frozen key piece (zamorak)',
	'Frozen key piece (armadyl)'
]);
export const grotesqueGuardiansCL = resolveItems([
	'Noon',
	'Black tourmaline core',
	'Granite gloves',
	'Granite ring',
	'Granite hammer',
	'Jar of stone',
	'Granite dust'
]);
export const hesporiCL = resolveItems(['Bottomless compost bucket', 'Iasor seed', 'Kronos seed', 'Attas seed']);
export const theInfernoCL = resolveItems(['Jal-nib-rek', 'Infernal cape']);
export const kalphiteQueenCL = resolveItems([
	'Kalphite princess',
	'Kq head',
	'Jar of sand',
	'Dragon 2h sword',
	'Dragon chainbody',
	'Dragon pickaxe'
]);
export const kingBlackDragonCL = resolveItems([
	'Prince black dragon',
	'Kbd heads',
	'Dragon pickaxe',
	'Draconic visage'
]);
export const krakenCL = resolveItems(['Pet kraken', 'Kraken tentacle', 'Trident of the seas (full)', 'Jar of dirt']);
export const theNightmareNormalCL = resolveItems([
	'Little nightmare',
	"Inquisitor's mace",
	"Inquisitor's great helm",
	"Inquisitor's hauberk",
	"Inquisitor's plateskirt",
	'Nightmare staff',
	'Volatile orb',
	'Harmonised orb',
	'Eldritch orb',
	'Jar of dreams'
]);
export const theNightmareCL = resolveItems([...theNightmareNormalCL, 'Slepey tablet', 'Parasitic egg']);
export const oborCL = resolveItems(['Hill giant club']);
export const sarachnisCL = resolveItems(['Sraracha', 'Jar of eyes', 'Giant egg sac(full)', 'Sarachnis cudgel']);
export const scorpiaCL = resolveItems(["Scorpia's offspring", 'Odium shard 3', 'Malediction shard 3']);
export const skotizoCL = resolveItems([
	'Skotos',
	'Jar of darkness',
	'Dark claw',
	'Dark totem',
	'Uncut onyx',
	'Ancient shard'
]);
export const spiritAnglerOutfit = resolveItems([
	'Spirit angler headband',
	'Spirit angler top',
	'Spirit angler waders',
	'Spirit angler boots'
]);
export const temporossCL = resolveItems([
	'Tiny tempor',
	'Big harpoonfish',
	...spiritAnglerOutfit,
	'Tome of water (empty)',
	'Soaked page',
	'Tackle box',
	'Fish barrel',
	'Dragon harpoon',
	'Spirit flakes'
]);
export const thermonuclearSmokeDevilCL = resolveItems([
	'Pet smoke devil',
	'Occult necklace',
	'Smoke battlestaff',
	'Dragon chainbody',
	'Jar of smoke'
]);
export const venenatisCL = resolveItems([
	'Venenatis spiderling',
	'Treasonous ring',
	'Dragon pickaxe',
	'Dragon 2h sword',
	'Fangs of venenatis',
	'Voidwaker gem'
]);
export const vetionCL = resolveItems([
	"Vet'ion jr.",
	'Ring of the gods',
	'Dragon pickaxe',
	'Dragon 2h sword',
	"Skull of vet'ion",
	'Voidwaker blade'
]);
export const vorkathCL = resolveItems([
	'Vorki',
	"Vorkath's head",
	'Draconic visage',
	'Skeletal visage',
	'Jar of decay',
	'Dragonbone necklace'
]);
export const wintertodtCL = resolveItems([
	'Phoenix',
	'Tome of fire',
	'Burnt page',
	'Pyromancer garb',
	'Pyromancer hood',
	'Pyromancer robe',
	'Pyromancer boots',
	'Warm gloves',
	'Bruma torch',
	'Dragon axe'
]);
export const zalcanoCL = resolveItems(['Smolcano', 'Crystal tool seed', 'Zalcano shard', 'Uncut onyx']);
export const zulrahCL = resolveItems([
	'Pet snakeling',
	'Tanzanite mutagen',
	'Magma mutagen',
	'Jar of swamp',
	'Magic fang',
	'Serpentine visage',
	'Tanzanite fang',
	'Zul-andra teleport',
	'Uncut onyx',
	"Zulrah's scales"
]);

export const chambersOfXericMetamorphPets = resolveItems([
	'Puppadile',
	'Tektiny',
	'Vanguard',
	'Vasa minirio',
	'Vespina'
]);
export const tobMetamorphPets = resolveItems(["Lil' Maiden", "Lil' Bloat", "Lil' Nylo", "Lil' Sot", "Lil' Xarp"]);
const toaMetamorphPets = resolveItems(['Zebo', "Tumeken's guardian", 'Kephriti', 'Babi', 'Akkhito']);
export const chambersOfXericNormalCL = resolveItems([
	'Olmlet',
	'Twisted bow',
	'Elder maul',
	'Kodai insignia',
	'Dragon claws',
	'Ancestral hat',
	'Ancestral robe top',
	'Ancestral robe bottom',
	"Dinh's bulwark",
	'Dexterous prayer scroll',
	'Arcane prayer scroll',
	'Dragon hunter crossbow',
	'Twisted buckler',
	'Torn prayer scroll',
	'Dark relic',
	'Onyx'
]);
export const chambersOfXericCL = resolveItems([
	...chambersOfXericNormalCL,
	'Metamorphic dust',
	'Twisted ancestral colour kit',
	"Xeric's guard",
	"Xeric's warrior",
	"Xeric's sentinel",
	"Xeric's general",
	"Xeric's champion"
]);
export const theatreOfBLoodNormalCL = resolveItems([
	"Lil' zik",
	'Scythe of vitur (uncharged)',
	'Ghrazi rapier',
	'Sanguinesti staff (uncharged)',
	'Justiciar faceguard',
	'Justiciar chestguard',
	'Justiciar legguards',
	'Avernic defender hilt',
	'Vial of blood',
	'Sinhaza shroud tier 1',
	'Sinhaza shroud tier 2',
	'Sinhaza shroud tier 3',
	'Sinhaza shroud tier 4',
	'Sinhaza shroud tier 5'
]);

export const theatreOfBLoodCL = resolveItems([
	...theatreOfBLoodNormalCL,
	'Sanguine dust',
	'Holy ornament kit',
	'Sanguine ornament kit'
]);

export const toaCL = resolveItems([
	"Tumeken's guardian",
	"Tumeken's shadow (uncharged)",
	"Elidinis' ward",
	'Masori mask',
	'Masori body',
	'Masori chaps',
	'Lightbearer',
	"Osmumten's fang",
	'Thread of elidinis',
	'Breach of the scarab',
	'Eye of the corruptor',
	'Jewel of the sun',
	'Menaphite ornament kit',
	'Cursed phalanx',
	'Masori crafting kit',
	'Cache of runes',
	"Icthlarin's shroud (tier 1)",
	"Icthlarin's shroud (tier 2)",
	"Icthlarin's shroud (tier 3)",
	"Icthlarin's shroud (tier 4)",
	"Icthlarin's shroud (tier 5)",
	'Remnant of akkha',
	'Remnant of ba-ba',
	'Remnant of kephri',
	'Remnant of zebak',
	'Ancient remnant'
]);

export const cluesBeginnerCL = resolveItems([
	'Mole slippers',
	'Frog slippers',
	'Bear feet',
	'Demon feet',
	'Jester cape',
	'Shoulder parrot',
	"Monk's robe top (t)",
	"Monk's robe (t)",
	'Amulet of defence (t)',
	'Sandwich lady hat',
	'Sandwich lady top',
	'Sandwich lady bottom',
	'Rune scimitar ornament kit (guthix)',
	'Rune scimitar ornament kit (saradomin)',
	'Rune scimitar ornament kit (zamorak)',
	'Black pickaxe'
]);

export const cluesEasyCL = resolveItems([
	'Team cape zero',
	'Team cape i',
	'Team cape x',
	'Cape of skulls',
	"Golden chef's hat",
	'Golden apron',
	'Wooden shield (g)',
	'Black full helm (t)',
	'Black platebody (t)',
	'Black platelegs (t)',
	'Black plateskirt (t)',
	'Black kiteshield (t)',
	'Black full helm (g)',
	'Black platebody (g)',
	'Black platelegs (g)',
	'Black plateskirt (g)',
	'Black kiteshield (g)',
	'Black shield (h1)',
	'Black shield (h2)',
	'Black shield (h3)',
	'Black shield (h4)',
	'Black shield (h5)',
	'Black helm (h1)',
	'Black helm (h2)',
	'Black helm (h3)',
	'Black helm (h4)',
	'Black helm (h5)',
	'Black platebody (h1)',
	'Black platebody (h2)',
	'Black platebody (h3)',
	'Black platebody (h4)',
	'Black platebody (h5)',
	'Steel full helm (t)',
	'Steel platebody (t)',
	'Steel platelegs (t)',
	'Steel plateskirt (t)',
	'Steel kiteshield (t)',
	'Steel full helm (g)',
	'Steel platebody (g)',
	'Steel platelegs (g)',
	'Steel plateskirt (g)',
	'Steel kiteshield (g)',
	'Iron platebody (t)',
	'Iron platelegs (t)',
	'Iron plateskirt (t)',
	'Iron kiteshield (t)',
	'Iron full helm (t)',
	'Iron platebody (g)',
	'Iron platelegs (g)',
	'Iron plateskirt (g)',
	'Iron kiteshield (g)',
	'Iron full helm (g)',
	'Bronze platebody (t)',
	'Bronze platelegs (t)',
	'Bronze plateskirt (t)',
	'Bronze kiteshield (t)',
	'Bronze full helm (t)',
	'Bronze platebody (g)',
	'Bronze platelegs (g)',
	'Bronze plateskirt (g)',
	'Bronze kiteshield (g)',
	'Bronze full helm (g)',
	'Studded body (g)',
	'Studded chaps (g)',
	'Studded body (t)',
	'Studded chaps (t)',
	'Leather body (g)',
	'Leather chaps (g)',
	'Blue wizard hat (g)',
	'Blue wizard robe (g)',
	'Blue skirt (g)',
	'Blue wizard hat (t)',
	'Blue wizard robe (t)',
	'Blue skirt (t)',
	'Black wizard hat (g)',
	'Black wizard robe (g)',
	'Black skirt (g)',
	'Black wizard hat (t)',
	'Black wizard robe (t)',
	'Black skirt (t)',
	"Monk's robe top (g)",
	"Monk's robe (g)",
	'Saradomin robe top',
	'Saradomin robe legs',
	'Guthix robe top',
	'Guthix robe legs',
	'Zamorak robe top',
	'Zamorak robe legs',
	'Ancient robe top',
	'Ancient robe legs',
	'Armadyl robe top',
	'Armadyl robe legs',
	'Bandos robe top',
	'Bandos robe legs',
	"Bob's red shirt",
	"Bob's green shirt",
	"Bob's blue shirt",
	"Bob's black shirt",
	"Bob's purple shirt",
	'Highwayman mask',
	'Blue beret',
	'Black beret',
	'White beret',
	'Red beret',
	'A powdered wig',
	'Beanie',
	'Imp mask',
	'Goblin mask',
	'Sleeping cap',
	'Flared trousers',
	'Pantaloons',
	'Black cane',
	'Staff of bob the cat',
	'Red elegant shirt',
	'Red elegant blouse',
	'Red elegant legs',
	'Red elegant skirt',
	'Green elegant shirt',
	'Green elegant blouse',
	'Green elegant legs',
	'Green elegant skirt',
	'Blue elegant shirt',
	'Blue elegant blouse',
	'Blue elegant legs',
	'Blue elegant skirt',
	'Amulet of magic (t)',
	'Amulet of power (t)',
	'Black pickaxe',
	'Ham joint',
	'Rain bow',
	'Willow comp bow'
]);
export const cluesMediumCL = resolveItems([
	'Ranger boots',
	'Wizard boots',
	'Holy sandals',
	'Climbing boots (g)',
	'Spiked manacles',
	'Adamant full helm (t)',
	'Adamant platebody (t)',
	'Adamant platelegs (t)',
	'Adamant plateskirt (t)',
	'Adamant kiteshield (t)',
	'Adamant full helm (g)',
	'Adamant platebody (g)',
	'Adamant platelegs (g)',
	'Adamant plateskirt (g)',
	'Adamant kiteshield (g)',
	'Adamant shield (h1)',
	'Adamant shield (h2)',
	'Adamant shield (h3)',
	'Adamant shield (h4)',
	'Adamant shield (h5)',
	'Adamant helm (h1)',
	'Adamant helm (h2)',
	'Adamant helm (h3)',
	'Adamant helm (h4)',
	'Adamant helm (h5)',
	'Adamant platebody (h1)',
	'Adamant platebody (h2)',
	'Adamant platebody (h3)',
	'Adamant platebody (h4)',
	'Adamant platebody (h5)',
	'Mithril full helm (t)',
	'Mithril platebody (t)',
	'Mithril platelegs (t)',
	'Mithril plateskirt (t)',
	'Mithril kiteshield (t)',
	'Mithril full helm (g)',
	'Mithril platebody (g)',
	'Mithril platelegs (g)',
	'Mithril plateskirt (g)',
	'Mithril kiteshield (g)',
	"Green d'hide body (g)",
	"Green d'hide body (t)",
	"Green d'hide chaps (g)",
	"Green d'hide chaps (t)",
	'Saradomin mitre',
	'Saradomin cloak',
	'Guthix mitre',
	'Guthix cloak',
	'Zamorak mitre',
	'Zamorak cloak',
	'Ancient mitre',
	'Ancient cloak',
	'Ancient stole',
	'Ancient crozier',
	'Armadyl mitre',
	'Armadyl cloak',
	'Armadyl stole',
	'Armadyl crozier',
	'Bandos mitre',
	'Bandos cloak',
	'Bandos stole',
	'Bandos crozier',
	...boaters,
	'Red headband',
	'Black headband',
	'Brown headband',
	'White headband',
	'Blue headband',
	'Gold headband',
	'Pink headband',
	'Green headband',
	'Crier hat',
	'Crier coat',
	'Crier bell',
	'Adamant cane',
	'Arceuus banner',
	'Piscarilius banner',
	'Hosidius banner',
	'Shayzien banner',
	'Lovakengj banner',
	'Cabbage round shield',
	'Black unicorn mask',
	'White unicorn mask',
	'Cat mask',
	'Penguin mask',
	'Leprechaun hat',
	'Black leprechaun hat',
	'Wolf mask',
	'Wolf cloak',
	'Purple elegant shirt',
	'Purple elegant blouse',
	'Purple elegant legs',
	'Purple elegant skirt',
	'Black elegant shirt',
	'White elegant blouse',
	'Black elegant legs',
	'White elegant skirt',
	'Pink elegant shirt',
	'Pink elegant blouse',
	'Pink elegant legs',
	'Pink elegant skirt',
	'Gold elegant shirt',
	'Gold elegant blouse',
	'Gold elegant legs',
	'Gold elegant skirt',
	'Gnomish firelighter',
	'Strength amulet (t)',
	'Yew comp bow'
]);
export const cluesHardCL = resolveItems([
	'Robin hood hat',
	'Dragon boots ornament kit',
	'Rune defender ornament kit',
	'Tzhaar-ket-om ornament kit',
	'Berserker necklace ornament kit',
	'Rune full helm (t)',
	'Rune platebody (t)',
	'Rune platelegs (t)',
	'Rune plateskirt (t)',
	'Rune kiteshield (t)',
	'Rune full helm (g)',
	'Rune platebody (g)',
	'Rune platelegs (g)',
	'Rune plateskirt (g)',
	'Rune kiteshield (g)',
	'Zamorak full helm',
	'Zamorak platebody',
	'Zamorak platelegs',
	'Zamorak plateskirt',
	'Zamorak kiteshield',
	'Guthix full helm',
	'Guthix platebody',
	'Guthix platelegs',
	'Guthix plateskirt',
	'Guthix kiteshield',
	'Saradomin full helm',
	'Saradomin platebody',
	'Saradomin platelegs',
	'Saradomin plateskirt',
	'Saradomin kiteshield',
	'Ancient full helm',
	'Ancient platebody',
	'Ancient platelegs',
	'Ancient plateskirt',
	'Ancient kiteshield',
	'Armadyl full helm',
	'Armadyl platebody',
	'Armadyl platelegs',
	'Armadyl plateskirt',
	'Armadyl kiteshield',
	'Bandos full helm',
	'Bandos platebody',
	'Bandos platelegs',
	'Bandos plateskirt',
	'Bandos kiteshield',
	'Rune shield (h1)',
	'Rune shield (h2)',
	'Rune shield (h3)',
	'Rune shield (h4)',
	'Rune shield (h5)',
	'Rune helm (h1)',
	'Rune helm (h2)',
	'Rune helm (h3)',
	'Rune helm (h4)',
	'Rune helm (h5)',
	'Rune platebody (h1)',
	'Rune platebody (h2)',
	'Rune platebody (h3)',
	'Rune platebody (h4)',
	'Rune platebody (h5)',
	'Saradomin coif',
	"Saradomin d'hide body",
	'Saradomin chaps',
	'Saradomin bracers',
	"Saradomin d'hide boots",
	"Saradomin d'hide shield",
	'Guthix coif',
	"Guthix d'hide body",
	'Guthix chaps',
	'Guthix bracers',
	"Guthix d'hide boots",
	"Guthix d'hide shield",
	'Zamorak coif',
	"Zamorak d'hide body",
	'Zamorak chaps',
	'Zamorak bracers',
	"Zamorak d'hide boots",
	"Zamorak d'hide shield",
	'Bandos coif',
	"Bandos d'hide body",
	'Bandos chaps',
	'Bandos bracers',
	"Bandos d'hide boots",
	"Bandos d'hide shield",
	'Armadyl coif',
	"Armadyl d'hide body",
	'Armadyl chaps',
	'Armadyl bracers',
	"Armadyl d'hide boots",
	"Armadyl d'hide shield",
	'Ancient coif',
	"Ancient d'hide body",
	'Ancient chaps',
	'Ancient bracers',
	"Ancient d'hide boots",
	"Ancient d'hide shield",
	"Red d'hide body (t)",
	"Red d'hide chaps (t)",
	"Red d'hide body (g)",
	"Red d'hide chaps (g)",
	"Blue d'hide body (t)",
	"Blue d'hide chaps (t)",
	"Blue d'hide body (g)",
	"Blue d'hide chaps (g)",
	'Enchanted hat',
	'Enchanted top',
	'Enchanted robe',
	'Saradomin stole',
	'Saradomin crozier',
	'Guthix stole',
	'Guthix crozier',
	'Zamorak stole',
	'Zamorak crozier',
	// Zombie head
	19_912,
	'Cyclops head',
	"Pirate's hat",
	'Red cavalier',
	'White cavalier',
	'Navy cavalier',
	'Tan cavalier',
	'Dark cavalier',
	'Black cavalier',
	'Pith helmet',
	'Explorer backpack',
	'Thieving bag',
	'Green dragon mask',
	'Blue dragon mask',
	'Red dragon mask',
	'Black dragon mask',
	'Nunchaku',
	'Dual sai',
	'Rune cane',
	'Amulet of glory (t4)',
	'Magic comp bow'
]);
export const cluesEliteCL = resolveItems([
	'Ring of 3rd age',
	'Fury ornament kit',
	'Dragon chainbody ornament kit',
	'Dragon legs/skirt ornament kit',
	'Dragon sq shield ornament kit',
	'Dragon full helm ornament kit',
	'Dragon scimitar ornament kit',
	'Light infinity colour kit',
	'Dark infinity colour kit',
	'Holy wraps',
	'Ranger gloves',
	"Rangers' tunic",
	"Rangers' tights",
	"Black d'hide body (g)",
	"Black d'hide chaps (g)",
	"Black d'hide body (t)",
	"Black d'hide chaps (t)",
	'Royal crown',
	'Royal sceptre',
	'Royal gown top',
	'Royal gown bottom',
	'Musketeer hat',
	'Musketeer tabard',
	'Musketeer pants',
	'Dark tuxedo jacket',
	'Dark trousers',
	'Dark tuxedo shoes',
	'Dark tuxedo cuffs',
	'Dark bow tie',
	'Light tuxedo jacket',
	'Light trousers',
	'Light tuxedo shoes',
	'Light tuxedo cuffs',
	'Light bow tie',
	'Arceuus scarf',
	'Hosidius scarf',
	'Piscarilius scarf',
	'Shayzien scarf',
	'Lovakengj scarf',
	'Bronze dragon mask',
	'Iron dragon mask',
	'Steel dragon mask',
	'Mithril dragon mask',
	'Adamant dragon mask',
	'Rune dragon mask',
	'Katana',
	'Dragon cane',
	'Briefcase',
	'Bucket helm',
	"Blacksmith's helm",
	'Deerstalker',
	'Afro',
	'Big pirate hat',
	'Top hat',
	'Monocle',
	'Sagacious spectacles',
	'Fremennik kilt',
	'Giant boot',
	"Uri's hat"
]);
export const cluesMasterCL = resolveItems([
	'Bloodhound',
	'Ring of 3rd age',
	'Armadyl godsword ornament kit',
	'Bandos godsword ornament kit',
	'Saradomin godsword ornament kit',
	'Zamorak godsword ornament kit',
	'Occult ornament kit',
	'Torture ornament kit',
	'Anguish ornament kit',
	'Dragon defender ornament kit',
	'Dragon kiteshield ornament kit',
	'Dragon platebody ornament kit',
	'Tormented ornament kit',
	'Hood of darkness',
	'Robe top of darkness',
	'Robe bottom of darkness',
	'Gloves of darkness',
	'Boots of darkness',
	'Samurai kasa',
	'Samurai shirt',
	'Samurai greaves',
	'Samurai boots',
	'Samurai gloves',
	'Ankou mask',
	'Ankou top',
	'Ankou gloves',
	'Ankou socks',
	"Ankou's leggings",
	"Mummy's head",
	"Mummy's feet",
	"Mummy's hands",
	"Mummy's legs",
	"Mummy's body",
	'Shayzien hood',
	'Hosidius hood',
	'Arceuus hood',
	'Piscarilius hood',
	'Lovakengj hood',
	'Lesser demon mask',
	'Greater demon mask',
	'Black demon mask',
	'Jungle demon mask',
	'Old demon mask',
	'Left eye patch',
	'Bowl wig',
	'Ale of the gods',
	'Obsidian cape (r)',
	'Half moon spectacles',
	'Fancy tiara'
]);

export const cluesHardRareCL = resolveItems([
	'3rd age range coif',
	'3rd age range top',
	'3rd age range legs',
	'3rd age vambraces',
	'3rd age robe top',
	'3rd age robe',
	'3rd age mage hat',
	'3rd age amulet',
	'3rd age plateskirt',
	'3rd age platelegs',
	'3rd age platebody',
	'3rd age full helmet',
	'3rd age kiteshield',
	'Gilded platebody',
	'Gilded platelegs',
	'Gilded plateskirt',
	'Gilded full helm',
	'Gilded kiteshield',
	'Gilded med helm',
	'Gilded chainbody',
	'Gilded sq shield',
	'Gilded 2h sword',
	'Gilded spear',
	'Gilded hasta'
]);
export const cluesEliteRareCL = resolveItems([
	'3rd age longsword',
	'3rd age wand',
	'3rd age cloak',
	'3rd age bow',
	'3rd age range coif',
	'3rd age range top',
	'3rd age range legs',
	'3rd age vambraces',
	'3rd age robe top',
	'3rd age robe',
	'3rd age mage hat',
	'3rd age amulet',
	'3rd age plateskirt',
	'3rd age platelegs',
	'3rd age platebody',
	'3rd age full helmet',
	'3rd age kiteshield',
	'Gilded scimitar',
	'Gilded boots',
	'Gilded platebody',
	'Gilded platelegs',
	'Gilded plateskirt',
	'Gilded full helm',
	'Gilded kiteshield',
	'Gilded med helm',
	'Gilded chainbody',
	'Gilded sq shield',
	'Gilded 2h sword',
	'Gilded spear',
	'Gilded hasta',
	'Gilded coif',
	"Gilded d'hide vambraces",
	"Gilded d'hide body",
	"Gilded d'hide chaps",
	'Gilded pickaxe',
	'Gilded axe',
	'Gilded spade',
	'Ring of nature',
	'Lava dragon mask'
]);
export const cluesMasterRareCL = resolveItems([
	'3rd age pickaxe',
	'3rd age axe',
	'3rd age longsword',
	'3rd age wand',
	'3rd age cloak',
	'3rd age bow',
	'3rd age range coif',
	'3rd age range top',
	'3rd age range legs',
	'3rd age vambraces',
	'3rd age robe top',
	'3rd age robe',
	'3rd age mage hat',
	'3rd age amulet',
	'3rd age plateskirt',
	'3rd age platelegs',
	'3rd age platebody',
	'3rd age full helmet',
	'3rd age kiteshield',
	'3rd age druidic robe bottoms',
	'3rd age druidic robe top',
	'3rd age druidic staff',
	'3rd age druidic cloak',
	'Gilded scimitar',
	'Gilded boots',
	'Gilded platebody',
	'Gilded platelegs',
	'Gilded plateskirt',
	'Gilded full helm',
	'Gilded kiteshield',
	'Gilded med helm',
	'Gilded chainbody',
	'Gilded sq shield',
	'Gilded 2h sword',
	'Gilded spear',
	'Gilded hasta',
	'Gilded coif',
	"Gilded d'hide vambraces",
	"Gilded d'hide body",
	"Gilded d'hide chaps",
	'Gilded pickaxe',
	'Gilded axe',
	'Gilded spade',
	'Bucket helm (g)',
	'Ring of coins'
]);

export const cluesRaresCL = [...new Set([...cluesHardRareCL, ...cluesEliteRareCL, ...cluesMasterRareCL])];

export const cluesSharedCL = resolveItems([
	'Saradomin page 1',
	'Saradomin page 2',
	'Saradomin page 3',
	'Saradomin page 4',
	'Zamorak page 1',
	'Zamorak page 2',
	'Zamorak page 3',
	'Zamorak page 4',
	'Guthix page 1',
	'Guthix page 2',
	'Guthix page 3',
	'Guthix page 4',
	'Bandos page 1',
	'Bandos page 2',
	'Bandos page 3',
	'Bandos page 4',
	'Armadyl page 1',
	'Armadyl page 2',
	'Armadyl page 3',
	'Armadyl page 4',
	'Ancient page 1',
	'Ancient page 2',
	'Ancient page 3',
	'Ancient page 4',
	'Holy blessing',
	'Unholy blessing',
	'Peaceful blessing',
	'War blessing',
	'Honourable blessing',
	'Ancient blessing',
	'Nardah teleport',
	"Mos le'harmless teleport",
	"Mort'ton teleport",
	'Feldip hills teleport',
	'Lunar isle teleport',
	'Digsite teleport',
	'Piscatoris teleport',
	'Pest control teleport',
	'Tai bwo wannai teleport',
	'Lumberyard teleport',
	'Iorwerth camp teleport',
	'Master scroll book (empty)',
	'Red firelighter',
	'Green firelighter',
	'Blue firelighter',
	'Purple firelighter',
	'White firelighter',
	'Charge dragonstone jewellery scroll',
	'Purple sweets'
]);

export const barbarianAssaultCL = resolveItems([
	'Pet penance queen',
	'Fighter hat',
	'Ranger hat',
	'Runner hat',
	'Healer hat',
	'Fighter torso',
	'Penance skirt',
	'Runner boots',
	'Penance gloves',
	'Granite helm',
	'Granite body'
]);
export const brimhavenAgilityArenaCL = resolveItems([
	'Agility arena ticket',
	'Brimhaven voucher',
	"Pirate's hook",
	'Brimhaven graceful hood',
	'Brimhaven graceful top',
	'Brimhaven graceful legs',
	'Brimhaven graceful gloves',
	'Brimhaven graceful boots',
	'Brimhaven graceful cape'
]);
export const castleWarsCL = resolveItems([
	'Red decorative full helm',
	'Red decorative helm',
	'Red decorative body',
	'Red decorative legs',
	'Red decorative skirt',
	'Red decorative boots',
	'Red decorative shield',
	'Red decorative sword',
	'White decorative full helm',
	'White decorative helm',
	'White decorative body',
	'White decorative legs',
	'White decorative skirt',
	'White decorative boots',
	'White decorative shield',
	'White decorative sword',
	'Gold decorative full helm',
	'Gold decorative helm',
	'Gold decorative body',
	'Gold decorative legs',
	'Gold decorative skirt',
	'Gold decorative boots',
	'Gold decorative shield',
	'Gold decorative sword',
	'Zamorak castlewars hood',
	'Zamorak castlewars cloak',
	'Saradomin castlewars hood',
	'Saradomin castlewars cloak',
	'Saradomin banner',
	'Zamorak banner',
	'Decorative magic hat',
	'Decorative magic top',
	'Decorative magic robe',
	'Decorative ranged top',
	'Decorative ranged legs',
	'Decorative quiver',
	'Saradomin halo',
	'Zamorak halo',
	'Guthix halo'
]);
export const fishingTrawlerCL = resolveItems(['Angler hat', 'Angler top', 'Angler waders', 'Angler boots']);
export const giantsFoundryCL = resolveItems([
	'Smiths tunic',
	'Smiths trousers',
	'Smiths boots',
	'Smiths gloves',
	'Colossal blade',
	'Double ammo mould',
	"Kovac's grog",
	'Smithing catalyst',
	'Ore pack'
]);
export const gnomeRestaurantCL = resolveItems(['Grand seed pod', 'Gnome scarf', 'Gnome goggles', 'Mint cake']);
export const guardiansOfTheRiftCL = resolveItems([
	'Abyssal protector',
	'Abyssal pearls',
	'Catalytic talisman',
	'Abyssal needle',
	'Abyssal green dye',
	'Abyssal blue dye',
	'Abyssal red dye ',
	'Hat of the eye',
	'Robe top of the eye',
	'Robe bottoms of the eye',
	'Boots of the eye',
	'Ring of the elements',
	'Abyssal lantern',
	"Guardian's eye",
	'Intricate pouch',
	'Lost bag',
	'Tarnished locket'
]);
export const hallowedSepulchreCL = resolveItems([
	'Hallowed mark',
	'Hallowed token',
	'Hallowed grapple',
	'Hallowed focus',
	'Hallowed symbol',
	'Hallowed hammer',
	'Hallowed ring',
	'Dark dye',
	'Dark acorn',
	'Strange old lockpick',
	'Ring of endurance (uncharged)',
	'Mysterious page 1',
	'Mysterious page 2',
	'Mysterious page 3',
	'Mysterious page 4',
	'Mysterious page 5'
]);
export const lastManStandingCL = resolveItems([
	"Deadman's chest",
	"Deadman's legs",
	"Deadman's cape",
	'Armadyl halo',
	'Bandos halo',
	'Seren halo',
	'Ancient halo',
	'Brassica halo',
	'Golden armadyl special attack',
	'Golden bandos special attack',
	'Golden saradomin special attack',
	'Golden zamorak special attack',
	"Victor's cape (1)",
	"Victor's cape (10)",
	"Victor's cape (50)",
	"Victor's cape (100)",
	"Victor's cape (500)",
	"Victor's cape (1000)",
	'Granite clamp',
	'Ornate maul handle',
	'Steam staff upgrade kit',
	'Lava staff upgrade kit',
	'Dragon pickaxe upgrade kit',
	'Ward upgrade kit',
	'Green dark bow paint',
	'Yellow dark bow paint',
	'White dark bow paint',
	'Blue dark bow paint',
	'Volcanic whip mix',
	'Frozen whip mix',
	'Guthixian icon',
	'Swift blade'
]);
export const magicTrainingArenaCL = resolveItems([
	'Beginner wand',
	'Apprentice wand',
	'Teacher wand',
	'Master wand',
	'Infinity hat',
	'Infinity top',
	'Infinity bottoms',
	'Infinity boots',
	'Infinity gloves',
	"Mage's book"
	// We cant unlock this spell
	// 'Bones to peaches'
]);
export const mahoganyHomesCL = resolveItems([
	'Builders supply crate',
	"Carpenter's helmet",
	"Carpenter's shirt",
	"Carpenter's trousers",
	"Carpenter's boots",
	"Amy's saw",
	'Plank sack',
	'Hosidius blueprints'
]);
export const pestControlCL = resolveItems([
	'Void knight mace',
	'Void knight top',
	'Void knight robe',
	'Void knight gloves',
	'Void mage helm',
	'Void melee helm',
	'Void ranger helm',
	'Void seal(8)',
	'Elite void top',
	'Elite void robe'
]);

export const roguesDenOutfit = resolveItems([
	'Rogue mask',
	'Rogue top',
	'Rogue trousers',
	'Rogue boots',
	'Rogue gloves'
]);
export const roguesDenCL = resolveItems([...roguesDenOutfit]);

export const shadesOfMorttonCL = resolveItems([
	'Amulet of the damned (full)',
	'Flamtaer bag',
	'Fine cloth',
	'Bronze locks',
	'Steel locks',
	'Black locks',
	'Silver locks',
	'Gold locks',
	"Zealot's helm",
	"Zealot's robe top",
	"Zealot's robe bottom",
	"Zealot's boots",
	"Tree wizards' journal",
	'Bloody notes'
]);
export const soulWarsCL = resolveItems(["Lil' creator", 'Red soul cape', 'Ectoplasmator']);

export const templeTrekkingOutfit = resolveItems([
	'Lumberjack hat',
	'Lumberjack top',
	'Lumberjack legs',
	'Lumberjack boots'
]);
export const templeTrekkingCL = resolveItems([...templeTrekkingOutfit]);

export const titheFarmCL = resolveItems([
	"Farmer's strawhat",
	"Farmer's jacket",
	"Farmer's boro trousers",
	"Farmer's boots",
	'Seed box',
	"Gricoller's can",
	'Herb sack'
]);
export const troubleBrewingCL = resolveItems([
	'Blue naval shirt',
	'Blue tricorn hat',
	'Blue navy slacks',
	'Green naval shirt',
	'Green tricorn hat',
	'Green navy slacks',
	'Red naval shirt',
	'Red tricorn hat',
	'Red navy slacks',
	'Brown naval shirt',
	'Brown tricorn hat',
	'Brown navy slacks',
	'Black naval shirt',
	'Black tricorn hat',
	'Black navy slacks',
	'Purple naval shirt',
	'Purple tricorn hat',
	'Purple navy slacks',
	'Grey naval shirt',
	'Grey tricorn hat',
	'Grey navy slacks',
	'Cutthroat flag',
	'Gilded smile flag',
	'Bronze fist flag',
	'Lucky shot flag',
	'Treasure flag',
	'Phasmatys flag',
	'The stuff',
	'Red rum (trouble brewing)',
	'Blue rum (trouble brewing)'
]);
export const volcanicMineCL = resolveItems([
	'Ash covered tome',
	'Large water container',
	'Volcanic mine teleport',
	'Dragon pickaxe (broken)'
]);
export const anglerOutfit = resolveItems(['Angler hat', 'Angler top', 'Angler waders', 'Angler boots']);
export const aerialFishingCL = resolveItems([
	'Golden tench',
	'Pearl fishing rod',
	'Pearl fly fishing rod',
	'Pearl barbarian rod',
	'Fish sack',
	...anglerOutfit
]);
export const allPetsCL = resolveItems([
	'Abyssal orphan',
	'Ikkle hydra',
	'Callisto cub',
	'Hellpuppy',
	'Pet chaos elemental',
	'Pet zilyana',
	'Pet dark core',
	'Pet dagannoth prime',
	'Pet dagannoth supreme',
	'Pet dagannoth rex',
	'Tzrek-jad',
	'Pet general graardor',
	'Baby mole',
	'Noon',
	'Jal-nib-rek',
	'Kalphite princess',
	'Prince black dragon',
	'Pet kraken',
	"Pet kree'arra",
	"Pet k'ril tsutsaroth",
	"Scorpia's offspring",
	'Skotos',
	'Pet smoke devil',
	'Venenatis spiderling',
	"Vet'ion jr.",
	'Vorki',
	'Phoenix',
	'Pet snakeling',
	'Olmlet',
	"Lil' zik",
	'Bloodhound',
	'Pet penance queen',
	'Heron',
	'Rock golem',
	'Beaver',
	'Baby chinchompa',
	'Giant squirrel',
	'Tangleroot',
	'Rocky',
	'Rift guardian',
	'Herbi',
	'Chompy chick',
	'Sraracha',
	'Smolcano',
	'Youngllef',
	'Little nightmare',
	"Lil' creator",
	'Tiny tempor',
	'Nexling',
	'Abyssal protector',
	"Tumeken's guardian",
	'Muphin',
	'Wisp',
	"Lil'viathan",
	'Butch',
	'Baron',
	'Scurry',
	'Smol heredit',
	'Nid'
]);
export const camdozaalCL = resolveItems([
	'Barronite mace',
	'Barronite head',
	'Barronite handle',
	'Barronite guard',
	'Ancient globe',
	'Ancient ledger',
	'Ancient astroscope',
	'Ancient treatise',
	'Ancient carcanet',
	'Imcando hammer'
]);

export const championScrolls = resolveItems([
	'Earth warrior champion scroll',
	'Ghoul champion scroll',
	'Giant champion scroll',
	'Goblin champion scroll',
	'Hobgoblin champion scroll',
	'Imp champion scroll',
	'Jogre champion scroll',
	'Lesser demon champion scroll',
	'Skeleton champion scroll',
	'Zombie champion scroll'
]);
export const championsChallengeCL = resolveItems([...championScrolls, "Champion's cape"]);
export const chaosDruisCL = resolveItems(['Elder chaos top', 'Elder chaos robe', 'Elder chaos hood']);
export const chompyBirdsCL = resolveItems([
	'Chompy chick',
	'Chompy bird hat (ogre bowman)',
	'Chompy bird hat (bowman)',
	'Chompy bird hat (ogre yeoman)',
	'Chompy bird hat (yeoman)',
	'Chompy bird hat (ogre marksman)',
	'Chompy bird hat (marksman)',
	'Chompy bird hat (ogre woodsman)',
	'Chompy bird hat (woodsman)',
	'Chompy bird hat (ogre forester)',
	'Chompy bird hat (forester)',
	'Chompy bird hat (ogre bowmaster)',
	'Chompy bird hat (bowmaster)',
	'Chompy bird hat (ogre expert)',
	'Chompy bird hat (expert)',
	'Chompy bird hat (ogre dragon archer)',
	'Chompy bird hat (dragon archer)',
	'Chompy bird hat (expert ogre dragon archer)',
	'Chompy bird hat (expert dragon archer)'
]);
export const colossalWyrmAgilityCL = resolveItems([
	'Colossal wyrm teleport scroll',
	'Calcified acorn',
	'Varlamore graceful hood',
	'Varlamore graceful top',
	'Varlamore graceful legs',
	'Varlamore graceful gloves',
	'Varlamore graceful boots',
	'Varlamore graceful cape'
]);
export const creatureCreationCL = resolveItems([
	'Tea flask',
	'Plain satchel',
	'Green satchel',
	'Red satchel',
	'Black satchel',
	'Gold satchel',
	'Rune satchel'
]);
export const cyclopsCL = resolveItems([
	'Bronze defender',
	'Iron defender',
	'Steel defender',
	'Black defender',
	'Mithril defender',
	'Adamant defender',
	'Rune defender',
	'Dragon defender'
]);
export const forestryCL = resolveItems([
	'Fox whistle',
	'Golden pheasant egg',
	'Lumberjack hat',
	'Lumberjack top',
	'Lumberjack legs',
	'Lumberjack boots',
	'Forestry hat',
	'Forestry top',
	'Forestry legs',
	'Forestry boots',
	"Twitcher's gloves",
	'Funky shaped log',
	'Log basket',
	'Log brace',
	'Clothes pouch blueprint',
	'Cape pouch',
	'Felling axe handle',
	'Pheasant hat',
	'Pheasant legs',
	'Pheasant boots',
	'Pheasant cape',
	'Petal garland',
	'Sturdy beehive parts'
]);

export const fossilIslandNotesCL = resolveItems([
	'Scribbled note',
	'Partial note',
	'Ancient note',
	'Ancient writings',
	'Experimental note',
	'Paragraph of text',
	'Musty smelling note',
	'Hastily scrawled note',
	'Old writing',
	'Short note'
]);
export const demonicGorillaCL = resolveItems([
	'Zenyte shard',
	'Light frame',
	'Heavy frame',
	'Ballista limbs',
	'Monkey tail',
	'Ballista spring'
]);
export const monkeyBackpacksCL = resolveItems([
	'Karamjan monkey',
	'Kruk jr',
	'Maniacal monkey',
	'Princely monkey',
	'Skeleton monkey',
	'Zombie monkey'
]);
export const motherlodeMineCL = resolveItems([
	'Coal bag',
	'Gem bag',
	'Prospector helmet',
	'Prospector jacket',
	'Prospector legs',
	'Prospector boots'
]);
export const myNotesCL = resolveItems([
	11_341, 11_342, 11_343, 11_344, 11_345, 11_346, 11_347, 11_348, 11_349, 11_350, 11_351, 11_352, 11_353, 11_354,
	11_355, 11_356, 11_357, 11_358, 11_359, 11_360, 11_361, 11_362, 11_363, 11_364, 11_365, 11_366
]);
export const randomEventsCL = resolveItems([
	'Camo top',
	'Camo bottoms',
	'Camo helmet',
	'Lederhosen top',
	'Lederhosen shorts',
	'Lederhosen hat',
	'Zombie shirt',
	'Zombie trousers',
	'Zombie mask',
	'Zombie gloves',
	'Zombie boots',
	'Mime mask',
	'Mime top',
	'Mime legs',
	'Mime gloves',
	'Mime boots',
	'Frog token',
	'Stale baguette',
	"Beekeeper's hat",
	"Beekeeper's top",
	"Beekeeper's legs",
	"Beekeeper's gloves",
	"Beekeeper's boots"
]);
export const revenantsCL = resolveItems([
	"Viggora's chainmace (u)",
	"Craw's bow (u)",
	"Thammaron's sceptre (u)",
	'Amulet of avarice',
	'Bracelet of ethereum (uncharged)',
	'Ancient crystal',
	'Ancient relic',
	'Ancient effigy',
	'Ancient medallion',
	'Ancient statuette',
	'Ancient totem',
	'Ancient emblem',
	'Revenant cave teleport',
	'Revenant ether'
]);
export const rooftopAgilityCL = resolveItems([
	'Mark of grace',
	'Graceful hood',
	'Graceful cape',
	'Graceful top',
	'Graceful legs',
	'Graceful gloves',
	'Graceful boots'
]);

export const shayzienArmourCL = resolveItems([
	'Shayzien gloves (1)',
	'Shayzien boots (1)',
	'Shayzien helm (1)',
	'Shayzien greaves (1)',
	'Shayzien platebody (1)',
	'Shayzien gloves (2)',
	'Shayzien boots (2)',
	'Shayzien helm (2)',
	'Shayzien greaves (2)',
	'Shayzien platebody (2)',
	'Shayzien gloves (3)',
	'Shayzien boots (3)',
	'Shayzien helm (3)',
	'Shayzien greaves (3)',
	'Shayzien platebody (3)',
	'Shayzien gloves (4)',
	'Shayzien boots (4)',
	'Shayzien helm (4)',
	'Shayzien greaves (4)',
	'Shayzien platebody (4)',
	'Shayzien gloves (5)',
	'Shayzien boots (5)',
	'Shayzien helm (5)',
	'Shayzien greaves (5)',
	'Shayzien body (5)'
]);
export const skillingPetsCL = resolveItems([
	'Heron',
	'Rock golem',
	'Beaver',
	'Baby chinchompa',
	'Giant squirrel',
	'Tangleroot',
	'Rocky',
	'Rift guardian'
]);
export const slayerCL = resolveItems([
	// Crawling hand
	7975,
	'Cockatrice head',
	'Basilisk head',
	'Kurask head',
	'Abyssal head',
	'Imbued heart',
	'Eternal gem',
	'Dust battlestaff',
	'Mist battlestaff',
	'Abyssal whip',
	'Granite maul',
	'Mudskipper hat',
	'Flippers',
	'Brine sabre',
	'Leaf-bladed sword',
	'Leaf-bladed battleaxe',
	'Black mask (10)',
	'Granite longsword',
	'Granite boots',
	'Wyvern visage',
	'Granite legs',
	'Granite helm',
	'Draconic visage',
	'Bronze boots',
	'Iron boots',
	'Steel boots',
	'Black boots',
	'Mithril boots',
	'Adamant boots',
	'Rune boots',
	'Dragon boots',
	'Abyssal dagger',
	'Uncharged trident',
	'Kraken tentacle',
	'Dark bow',
	'Occult necklace',
	'Dragon chainbody',
	'Dragon thrownaxe',
	'Dragon harpoon',
	'Dragon sword',
	'Dragon knife',
	'Broken dragon hasta',
	"Drake's tooth",
	"Drake's claw",
	'Hydra tail',
	"Hydra's fang",
	"Hydra's eye",
	"Hydra's heart",
	'Mystic hat (light)',
	'Mystic robe top (light)',
	'Mystic robe bottom (light)',
	'Mystic gloves (light)',
	'Mystic boots (light)',
	'Mystic hat (dark)',
	'Mystic robe top (dark)',
	'Mystic robe bottom (dark)',
	'Mystic gloves (dark)',
	'Mystic boots (dark)',
	'Mystic hat (dusk)',
	'Mystic robe top (dusk)',
	'Mystic robe bottom (dusk)',
	'Mystic gloves (dusk)',
	'Mystic boots (dusk)',
	'Basilisk jaw',
	"Dagon'hai hat",
	"Dagon'hai robe top",
	"Dagon'hai robe bottom",
	'Blood shard',
	'Ancient ceremonial mask',
	'Ancient ceremonial top',
	'Ancient ceremonial legs',
	'Ancient ceremonial gloves',
	'Ancient ceremonial boots',
	'Aranea boots'
]);

export const tormentedDemonCL = resolveItems(['Tormented synapse', 'Burning claw', 'Guthixian temple teleport']);

export const tzHaarCL = resolveItems([
	'Obsidian cape',
	'Toktz-ket-xil',
	'Tzhaar-ket-om',
	'Toktz-xil-ak',
	'Toktz-xil-ek',
	'Toktz-mej-tal',
	'Toktz-xil-ul',
	'Obsidian helmet',
	'Obsidian platebody',
	'Obsidian platelegs'
]);

export const evilChickenOutfit = resolveItems([
	'Evil chicken head',
	'Evil chicken wings',
	'Evil chicken legs',
	'Evil chicken feet'
]);
export const miscellaneousCL = resolveItems([
	'Herbi',
	'Chompy chick',
	'Dragon warhammer',
	'Big swordfish',
	'Big shark',
	'Big bass',
	'Long bone',
	'Curved bone',
	'Ecumenical key',
	"Pharaoh's sceptre",
	'Dark totem base',
	'Dark totem middle',
	'Dark totem top',
	'Chewed bones',
	'Dragon full helm',
	'Shield left half',
	'Dragon metal slice',
	'Dragon metal lump',
	'Dragon limbs',
	'Dragon spear',
	'Amulet of eternal glory',
	'Shaman mask',
	...evilChickenOutfit,
	'Mining gloves',
	'Superior mining gloves',
	'Expert mining gloves',
	'Right skull half',
	'Left skull half',
	'Top of sceptre',
	'Bottom of sceptre',
	'Mossy key',
	'Giant key',
	'Hespori seed',
	'Fresh crab claw',
	'Fresh crab shell',
	"Xeric's talisman (inert)",
	'Mask of ranul',
	'Elven signet',
	'Crystal grail',
	'Enhanced crystal teleport seed',
	'Dragonstone full helm',
	'Dragonstone platebody',
	'Dragonstone platelegs',
	'Dragonstone gauntlets',
	'Dragonstone boots',
	'Uncut onyx',
	'Merfolk trident',
	'Orange egg sac',
	'Blue egg sac',
	'Broken zombie axe'
]);

export const diariesCL = [
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
	"Rada's blessing 4"
];
export const dailyCL = resolveItems([
	'Goblin paint cannon',
	'Green banner',
	'Spinning plate',
	'Brown toy horsey',
	'White toy horsey',
	'Black toy horsey',
	'Grey toy horsey',
	11_705,
	11_706,
	'Tiger toy',
	'Lion toy',
	'Snow leopard toy',
	'Amur leopard toy',
	'Holy handegg',
	'Peaceful handegg',
	'Chaotic handegg',
	'Rainbow scarf',
	"Diango's claws",
	'Hornwood helm',
	'Hand fan',
	'Mask of balance',
	'Druidic wreath',
	'Disk of returning',
	'Mystery box',
	'Stale baguette'
]);
export const capesCL = resolveItems([
	'Mining hood',
	'Mining cape(t)',
	'Smithing hood',
	'Smithing cape(t)',
	'Woodcutting hood',
	'Woodcut. cape(t)',
	'Firemaking hood',
	'Firemaking cape(t)',
	'Fishing hood',
	'Fishing cape(t)',
	'Agility hood',
	'Agility cape(t)',
	'Cooking hood',
	'Cooking cape(t)',
	'Crafting hood',
	'Crafting cape(t)',
	'Prayer hood',
	'Prayer cape(t)',
	'Fletching hood',
	'Fletching cape(t)',
	'Runecraft hood',
	'Runecraft cape(t)',
	'Thieving hood',
	'Thieving cape(t)',
	'Farming hood',
	'Farming cape(t)',
	'Herblore hood',
	'Herblore cape(t)',
	'Hunter hood',
	'Hunter cape(t)',
	'Construct. hood',
	'Construct. cape(t)',
	'Magic hood',
	'Magic cape(t)',
	'Attack hood',
	'Attack cape(t)',
	'Strength hood',
	'Strength cape(t)',
	'Defence hood',
	'Defence cape(t)',
	'Hitpoints hood',
	'Hitpoints cape(t)',
	'Ranging hood',
	'Ranging cape(t)',
	'Slayer hood',
	'Slayer cape(t)',
	'Quest point hood',
	'Quest point cape',
	'Quest point cape(t)',
	'Achievement diary hood',
	'Achievement diary cape',
	'Achievement diary cape(t)',
	'Music hood',
	'Music cape',
	'Music cape (t)',
	'Max hood',
	'Max cape',
	'Ardougne max hood',
	'Ardougne max cape',
	'Infernal max hood',
	'Infernal max cape',
	'Assembler max hood',
	'Assembler max cape',
	'Masori assembler max hood',
	'Masori assembler max cape',
	'Imbued guthix max hood',
	'Imbued guthix max cape',
	'Imbued saradomin max hood',
	'Imbued saradomin max cape',
	'Imbued zamorak max hood',
	'Imbued zamorak max cape',
	'Mythical max hood',
	'Mythical max cape',
	'Fire max hood',
	'Fire max cape',
	"Champion's cape",
	'Mythical cape',
	'Fire cape',
	'Infernal cape',
	'Imbued saradomin cape',
	'Imbued guthix cape',
	'Imbued zamorak cape',
	'Saradomin cape',
	'Guthix cape',
	'Zamorak cape',
	'Saradomin castlewars cloak',
	'Zamorak castlewars cloak',
	'Red soul cape',
	'Blue soul cape',
	"Deadman's cape",
	"Victor's cape (1)",
	"Victor's cape (10)",
	"Victor's cape (50)",
	"Victor's cape (100)",
	"Victor's cape (500)",
	"Victor's cape (1000)",
	'Cape of legends',
	'Ardougne cloak 1',
	'Ardougne cloak 2',
	'Ardougne cloak 3',
	'Ardougne cloak 4',
	'Obsidian cape',
	'Obsidian cape (r)',
	'Jester cape',
	'Cape of skulls',
	'Team cape zero',
	'Team cape i',
	'Team cape x',
	'Graceful cape',
	'Arceuus graceful cape',
	'Piscarilius graceful cape',
	'Lovakengj graceful cape',
	'Shayzien graceful cape',
	'Hosidius graceful cape',
	'Kourend graceful cape',
	'Brimhaven graceful cape',
	'Dark graceful cape',
	'3rd age druidic cloak',
	'3rd age cloak',
	'Ancient cloak',
	'Armadyl cloak',
	'Bandos cloak',
	'Saradomin cloak',
	'Guthix cloak',
	'Zamorak cloak',
	'Spotted cape',
	'Spottier cape',
	"Xeric's guard",
	"Xeric's warrior",
	"Xeric's sentinel",
	"Xeric's general",
	"Xeric's champion",
	'Sinhaza shroud tier 1',
	'Sinhaza shroud tier 2',
	'Sinhaza shroud tier 3',
	'Sinhaza shroud tier 4',
	'Sinhaza shroud tier 5',
	"Icthlarin's hood (tier 5)",
	"Icthlarin's shroud (tier 1)",
	"Icthlarin's shroud (tier 2)",
	"Icthlarin's shroud (tier 3)",
	"Icthlarin's shroud (tier 4)",
	"Icthlarin's shroud (tier 5)"
]);
export const questCL = resolveItems([
	'Quest point hood',
	'Quest point cape',
	'Helm of neitiznot',
	'Anti-dragon shield',
	'Goldsmith gauntlets',
	'Cooking gauntlets',
	'Magic secateurs',
	'Barrows gloves',
	'Dragon gloves',
	'Rune gloves',
	'Adamant gloves',
	'Mithril gloves',
	'Black gloves',
	'Steel gloves',
	'Iron gloves',
	'Bronze gloves',
	'Hardleather gloves'
]);

export const implingsCL = objectEntries(implings).map(m => Number(m[0]));

export const gracefulCL = resolveItems([
	...gracefulHoods,
	...gracefulTops,
	...gracefulLegs,
	...gracefulFeet,
	...gracefulHands,
	...gracefulCapes
]).filter(id => !resolveItems(['Max cape', 'Agility cape', 'Agility cape(t)']).includes(id));

const metamorphPets = resolveItems([
	'Little parasite',
	'Dark squirrel',
	'Baby mole-rat',
	'Midnight',
	'Tzrek-zuk',
	'Ziggy',
	'Red',
	'Great blue heron',
	'Greatish guardian',
	28_670, // use id to not get mixed up with the "Fox" quest item
	'Pheasant'
]);

export const allPetIDs = [
	...allPetsCL,
	...chambersOfXericMetamorphPets,
	...tobMetamorphPets,
	...growablePets.flatMap(petSeries => petSeries.stages),
	...metamorphPets,
	...toaMetamorphPets
];

export const allClueItems = [
	...cluesBeginnerCL,
	...cluesEasyCL,
	...cluesEliteCL,
	...cluesEliteRareCL,
	...cluesHardCL,
	...cluesHardRareCL,
	...cluesMasterCL,
	...cluesMasterRareCL,
	...cluesMediumCL,
	...cluesSharedCL
];

interface LMSBuyable {
	item: Item;
	cost: number | null;
	quantity?: number;
	onlyCL?: true;
	wins?: number;
}

export const LMSBuyables: LMSBuyable[] = [
	{ item: getOSItem("Deadman's chest"), cost: 160 },
	{ item: getOSItem("Deadman's legs"), cost: 160 },
	{ item: getOSItem("Deadman's cape"), cost: 160 },
	{ item: getOSItem('Swift blade'), cost: 350 },
	{ item: getOSItem('Guthixian icon'), cost: 500 },
	{ item: getOSItem('Trouver parchment'), cost: 18 },
	{ item: getOSItem('Wilderness crabs teleport'), cost: 1 },
	{ item: getOSItem('Blighted entangle sack'), quantity: 70, cost: 1 },
	{ item: getOSItem('Blighted teleport spell sack'), quantity: 50, cost: 1 },
	{ item: getOSItem('Blighted vengeance sack'), quantity: 50, cost: 1 },
	{ item: getOSItem('Blighted ancient ice sack'), quantity: 30, cost: 1 },
	{ item: getOSItem('Adamant arrow'), quantity: 350, cost: 1 },
	{ item: getOSItem('Bolt rack'), quantity: 200, cost: 1 },
	{ item: getOSItem('Rune arrow'), quantity: 300, cost: 3 },
	{ item: getOSItem('Dragonstone bolts (e)'), quantity: 20, cost: 3 },
	{ item: getOSItem('Blighted karambwan'), quantity: 12, cost: 1 },
	{ item: getOSItem('Blighted manta ray'), quantity: 15, cost: 1 },
	{ item: getOSItem('Blighted anglerfish'), quantity: 15, cost: 1 },
	{ item: getOSItem('Blighted super restore(4)'), quantity: 4, cost: 1 },
	{ item: getOSItem('Climbing boots'), quantity: 20, cost: 1 },
	{ item: getOSItem('Looting bag'), cost: 1 },
	{ item: getOSItem('Looting bag note'), cost: 1 },
	{ item: getOSItem('Ring of wealth scroll'), cost: 5 },
	{ item: getOSItem('Magic shortbow scroll'), cost: 5 },
	{ item: getOSItem('Clue box'), cost: 5 },
	{ item: getOSItem('Crystal weapon seed'), cost: 12 },
	{ item: getOSItem('Granite clamp'), cost: 25 },
	{ item: getOSItem('Ornate maul handle'), cost: 15 },
	{ item: getOSItem('Steam staff upgrade kit'), cost: 13 },
	{ item: getOSItem('Lava staff upgrade kit'), cost: 13 },
	{ item: getOSItem('Dragon pickaxe upgrade kit'), cost: 14 },
	{ item: getOSItem('Ward upgrade kit'), cost: 20 },
	{ item: getOSItem('Green dark bow paint'), cost: 25 },
	{ item: getOSItem('Yellow dark bow paint'), cost: 25 },
	{ item: getOSItem('White dark bow paint'), cost: 25 },
	{ item: getOSItem('Blue dark bow paint'), cost: 25 },
	{ item: getOSItem('Volcanic whip mix'), cost: 25 },
	{ item: getOSItem('Frozen whip mix'), cost: 25 },
	{ item: getOSItem('Rune pouch'), cost: 75 },
	{ item: getOSItem('Rune pouch note'), cost: 75 },
	{ item: getOSItem('Decorative emblem'), cost: 100 },
	{ item: getOSItem("Saradomin's tear"), cost: 150 },
	{ item: getOSItem('Target teleport scroll'), cost: 250 },
	{ item: getOSItem("Vesta's longsword (inactive)"), cost: 300 },
	{ item: getOSItem('Armadyl halo'), cost: 450 },
	{ item: getOSItem('Bandos halo'), cost: 450 },
	{ item: getOSItem('Seren halo'), cost: 450 },
	{ item: getOSItem('Ancient halo'), cost: 450 },
	{ item: getOSItem('Brassica halo'), cost: 450 },
	{ item: getOSItem('Paddewwa teleport'), quantity: 2, cost: 1 },
	{ item: getOSItem('Senntisten teleport'), quantity: 2, cost: 1 },
	{ item: getOSItem('Annakarl teleport'), quantity: 2, cost: 1 },
	{ item: getOSItem('Carrallanger teleport'), quantity: 2, cost: 1 },
	{ item: getOSItem('Dareeyak teleport'), quantity: 2, cost: 1 },
	{ item: getOSItem('Ghorrock teleport'), quantity: 2, cost: 1 },
	{ item: getOSItem('Kharyrll teleport'), quantity: 2, cost: 1 },
	{ item: getOSItem('Lassar teleport'), quantity: 2, cost: 1 },
	{ item: getOSItem('Target teleport'), cost: 1 },
	// Capes
	{ item: getOSItem("Victor's cape (1)"), cost: null, wins: 1 },
	{ item: getOSItem("Victor's cape (10)"), cost: null, wins: 10 },
	{ item: getOSItem("Victor's cape (50)"), cost: null, wins: 50 },
	{ item: getOSItem("Victor's cape (100)"), cost: null, wins: 100 },
	{ item: getOSItem("Victor's cape (500)"), cost: null, wins: 500 },
	{ item: getOSItem("Victor's cape (1000)"), cost: null, wins: 1000 },
	// Special attacks
	{ item: getOSItem('Golden armadyl special attack'), cost: 75, onlyCL: true },
	{ item: getOSItem('Golden saradomin special attack'), cost: 75, onlyCL: true },
	{ item: getOSItem('Golden bandos special attack'), cost: 75, onlyCL: true },
	{ item: getOSItem('Golden zamorak special attack'), cost: 75, onlyCL: true }
];

export const NexCL = resolveItems([
	'Nexling',
	'Ancient hilt',
	'Nihil horn',
	'Zaryte vambraces',
	'Torva full helm (damaged)',
	'Torva platebody (damaged)',
	'Torva platelegs (damaged)',
	'Nihil shard'
]);

export const dukeSucellusCL = resolveItems([
	'Baron',
	'Eye of the duke',
	'Virtus mask',
	'Virtus robe top',
	'Virtus robe bottom',
	'Magus vestige',
	'Chromium ingot',
	"Awakener's orb",
	'Ice quartz',
	'Frozen tablet'
]);

export const theLeviathanCL = resolveItems([
	"Lil'viathan",
	"Leviathan's lure",
	'Virtus mask',
	'Virtus robe top',
	'Virtus robe bottom',
	'Venator vestige',
	'Chromium ingot',
	"Awakener's orb",
	'Smoke quartz',
	'Scarred tablet'
]);

export const theWhispererCL = resolveItems([
	'Wisp',
	"Siren's staff",
	'Virtus mask',
	'Virtus robe top',
	'Virtus robe bottom',
	'Bellator vestige',
	'Chromium ingot',
	"Awakener's orb",
	'Shadow quartz',
	'Sirenic tablet'
]);

export const vardorvisCL = resolveItems([
	'Butch',
	"Executioner's axe head",
	'Virtus mask',
	'Virtus robe top',
	'Virtus robe bottom',
	'Ultor vestige',
	'Chromium ingot',
	"Awakener's orb",
	'Blood quartz',
	'Strangled tablet'
]);

export const araxxorCL = resolveItems([
	'Nid',
	'Araxyte venom sack',
	'Spider cave teleport',
	'Araxyte fang',
	'Noxious point',
	'Noxious blade',
	'Noxious pommel',
	'Araxyte head',
	'Jar of venom',
	'Coagulated venom'
]);
