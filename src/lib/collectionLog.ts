import Agility, { gracefulItems } from './skilling/skills/agility';
import { removeDuplicatesFromArray } from './util';
import resolveItems from './util/resolveItems';

const nightmareLog = resolveItems([
	"Inquisitor's great helm",
	"Inquisitor's hauberk",
	"Inquisitor's plateskirt",
	"Inquisitor's mace",
	'Nightmare staff',
	'Eldritch orb',
	'Volatile orb',
	'Harmonised orb',
	'Jar of dreams',
	'Little nightmare'
]);

const wintertodtLog = resolveItems([
	'Phoenix',
	'Pyromancer hood',
	'Pyromancer garb',
	'Pyromancer robe',
	'Pyromancer boots',
	'Warm gloves',
	'Bruma torch',
	'Burnt page',
	'Tome of fire',
	'Dragon axe'
]);

const barbAssaultLog = resolveItems([
	'Pet penance queen',
	'Fighter torso',
	'Fighter hat',
	'Healer hat',
	'Runner hat',
	'Ranger hat',
	'Runner boots',
	'Penance gloves',
	'Penance skirt'
]);

const agilityArenaLog = resolveItems([
	'Agility arena ticket',
	"Pirate's hook",
	'Brimhaven graceful hood',
	'Brimhaven graceful top',
	'Brimhaven graceful legs',
	'Brimhaven graceful gloves',
	'Brimhaven graceful boots',
	'Brimhaven graceful cape'
]);

const zalcanoLog = resolveItems([
	'Crystal shard',
	'Zalcano shard',
	'Smolcano',
	'Uncut onyx',
	'Crystal tool seed	'
]);

export const farmersOutfit = resolveItems([
	`Farmer's strawhat`,
	`Farmer's jacket`,
	`Farmer's shirt`,
	`Farmer's boro trousers`,
	`Farmer's boots`,
	`Tangleroot`
]);

export const anglerOutfit = resolveItems([
	'Angler hat',
	'Angler top',
	'Angler waders',
	'Angler boots'
]);

const hunterGear: CollectionLogData = {
	CamouflageGear: resolveItems([
		'Polar camo top',
		'Polar camo legs',
		'Wood camo top',
		'Wood camo legs',
		'Jungle camo top',
		'Jungle camo legs',
		'Desert camo top',
		'Desert camo legs'
	]),
	HunterGear: resolveItems([
		'Larupia hat',
		'Larupia top',
		'Larupia legs',
		'Graahk headdress',
		'Graahk top',
		'Graahk legs',
		'Kyatt hat',
		'Kyatt top',
		'Kyatt legs'
	]),
	Other: resolveItems([
		'Spotted cape',
		'Spottier cape',
		'Gloves of silence',
		'Golden tench',
		'Baby chinchompa',
		'Herbi'
	])
};

const fishingTrawler: CollectionLogData = {
	AnglerOutfit: anglerOutfit,
	Junk: resolveItems([
		'Broken arrow',
		'Broken glass',
		'Broken staff',
		'Buttons',
		'Damaged armour',
		'Old boot',
		'Oyster',
		'Pot',
		'Rusty sword'
	]),
	Fish: resolveItems([
		'Raw shrimps',
		'Raw sardine',
		'Raw anchovies',
		'Raw tuna',
		'Raw lobster',
		'Raw swordfish',
		'Raw shark',
		'Raw sea turtle',
		'Raw manta ray'
	])
};

const barrows: CollectionLogData = {
	Barrows: resolveItems([
		"Ahrim's staff",
		"Ahrim's hood",
		"Ahrim's robetop",
		"Ahrim's robeskirt",
		"Dharok's greataxe",
		"Dharok's helm",
		"Dharok's platebody",
		"Dharok's platelegs",
		"Guthan's warspear",
		"Guthan's helm",
		"Guthan's platebody",
		"Guthan's chainskirt"
	]),
	'Barrows 2': resolveItems([
		"Karil's crossbow",
		"Karil's coif",
		"Karil's leathertop",
		"Karil's leatherskirt",
		"Torag's hammers",
		"Torag's helm",
		"Torag's platebody",
		"Torag's platelegs",
		"Verac's flail",
		"Verac's helm",
		"Verac's brassard",
		"Verac's plateskirt"
	])
};

export const bosses: CollectionLogData = {
	Zulrah: resolveItems([
		'Uncut onyx',
		'Tanzanite fang',
		'Magic fang',
		'Serpentine visage',
		'Magma mutagen',
		'Tanzanite mutagen',
		'Jar of swamp',
		'Pet snakeling'
	]),
	Shards: resolveItems(['Godsword shard 1', 'Godsword shard 2', 'Godsword shard 3']),
	Zammy: resolveItems([
		'Steam battlestaff',
		'Zamorakian spear',
		'Staff of the dead',
		'Zamorak hilt',
		"Pet k'ril tsutsaroth"
	]),
	Bandos: resolveItems([
		'Bandos chestplate',
		'Bandos tassets',
		'Bandos boots',
		'Bandos hilt',
		'Pet general graardor'
	]),
	Saradomin: resolveItems([
		'Saradomin sword',
		"Saradomin's light",
		'Armadyl crossbow',
		'Saradomin hilt',
		'Pet zilyana'
	]),
	Arma: resolveItems([
		'Armadyl helmet',
		'Armadyl chestplate',
		'Armadyl chainskirt',
		'Armadyl hilt',
		"Pet kree'arra"
	]),
	'Corp Beast': resolveItems([
		'Spirit shield',
		'Holy elixir',
		'Spectral sigil',
		'Arcane sigil',
		'Elysian sigil',
		'Pet dark core'
	]),
	Cerberus: resolveItems([
		'Primordial crystal',
		'Pegasian crystal',
		'Eternal crystal',
		'Smouldering stone',
		'Jar of souls',
		'Hellpuppy'
	]),
	'Dagannoth Kings': resolveItems([
		'Dragon axe',
		'Mud battlestaff',
		'Seercull',
		'Warrior ring',
		'Seers ring',
		'Archers ring',
		'Berserker ring',
		'Pet dagannoth prime',
		'Pet dagannoth supreme',
		'Pet dagannoth rex'
	]),
	Vorkath: resolveItems([
		'Dragonbone necklace',
		"Vorkath's head",
		'Skeletal visage',
		'Draconic visage',
		'Jar of decay',
		'Vorki'
	]),
	'Giant Mole': resolveItems(['Long bone', 'Curved bone', 'Baby mole']),
	'Kalphite queen': resolveItems([
		'Dragon chainbody',
		'Dragon 2h sword',
		'Kq head',
		'Jar of sand',
		'Kalphite princess'
	]),
	'Lizardman shaman': resolveItems(['Dragon warhammer']),
	Callisto: resolveItems([
		'Dragon pickaxe',
		'Dragon 2h sword',
		'Tyrannical ring',
		'Callisto cub'
	]),
	Venenatis: resolveItems([
		'Dragon pickaxe',
		'Dragon 2h sword',
		'Treasonous ring',
		'Venenatis spiderling'
	]),
	Vetion: resolveItems(['Dragon pickaxe', 'Dragon 2h sword', 'Ring of the gods', "Vet'ion jr."]),
	'King Black Dragon': resolveItems([
		'Dragon pickaxe',
		'Dragon med helm',
		'Kbd heads',
		'Draconic visage',
		'Prince black dragon'
	]),
	'Chaos Ele': resolveItems(['Dragon pickaxe', 'Dragon 2h sword', 'Pet chaos elemental']),
	'Chaos Fanatic': resolveItems(['Malediction shard 1', 'Odium shard 1', 'Pet chaos elemental']),
	'Crazy Arch': resolveItems(['Malediction shard 2', 'Odium shard 2', 'Fedora']),
	Scorpia: resolveItems(['Malediction shard 3', 'Odium shard 3', "Scorpia's offspring"]),
	Sarachnis: resolveItems(['Giant egg sac(full)', 'Sarachnis cudgel', 'Jar of eyes', 'Sraracha']),
	Nightmare: nightmareLog,
	Zalcano: zalcanoLog,
	Wintertodt: wintertodtLog
};

export const pets: CollectionLogData = {
	'Skilling Pets': resolveItems([
		'Heron',
		'Rock golem',
		'Beaver',
		'Baby chinchompa',
		'Giant squirrel',
		'Tangleroot',
		'Rocky',
		'Rift guardian'
	]),
	'Boss Pets': resolveItems([
		"Pet k'ril tsutsaroth",
		'Pet general graardor',
		'Pet zilyana',
		"Pet kree'arra",
		'Pet dagannoth rex',
		'Pet dagannoth prime',
		'Pet dagannoth supreme',
		'Pet snakeling',
		'Vorki',
		'Pet dark core',
		'Olmlet',
		"Lil'zik"
	]),
	'Boss Pets 2': resolveItems([
		'Kalphite princess',
		'Baby mole',
		'Sraracha',
		"Vet'ion jr.",
		'Callisto cub',
		'Venenatis spiderling',
		"Scorpia's offspring",
		'Prince black dragon',
		'Pet chaos elemental',
		'Skotos',
		'Tzrek-jad',
		'Jal-nib-rek'
	]),
	'Boss Pets 3': resolveItems(['Little Nightmare']),
	'Slayer Boss Pets': resolveItems([
		'Noon',
		'Abyssal orphan',
		'Pet kraken',
		'Hellpuppy',
		'Pet smoke devil',
		'Ikkle hydra'
	]),
	Other: resolveItems([
		'Bloodhound',
		'Herbi',
		'Chompy chick',
		'Pet penance queen',
		'Phoenix',
		'Smolcano',
		'Youngllef'
	]),
	Special: resolveItems(['Dark squirrel'])
};

export const cluesShared: CollectionLogData = {
	'God Pages': resolveItems([
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
		'Guthix page 4'
	]),
	'God Pages 2': resolveItems([
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
		'Ancient page 4'
	]),
	Blessings: resolveItems([
		'Holy blessing',
		'Unholy blessing',
		'Peaceful blessing',
		'Honourable blessing',
		'War blessing',
		'Ancient blessing'
	])
};

export const cluesBeginner: CollectionLogData = {
	'Beginner Clues': resolveItems([
		'Mole slippers',
		'Frog slippers',
		'Bear feet',
		'Demon feet',
		'Jester cape',
		'Sandwich lady hat',
		'Sandwich lady top',
		'Sandwich lady bottom',
		'Shoulder parrot',
		'Amulet of defence (t)',
		"Monk's robe top (t)",
		"Monk's robe (t)"
	]),
	'Rune scimitar ornament kits': resolveItems([
		'Rune scimitar ornament kit (saradomin)',
		'Rune scimitar ornament kit (guthix)',
		'Rune scimitar ornament kit (zamorak)'
	])
};
export const cluesEasy = {
	'Bronze trimmed armor': resolveItems([
		'Bronze full helm (t)',
		'Bronze platebody (t)',
		'Bronze platelegs (t)',
		'Bronze plateskirt (t)',
		'Bronze kiteshield (t)',
		'Bronze full helm (g)',
		'Bronze platebody (g)',
		'Bronze platelegs (g)',
		'Bronze plateskirt (g)',
		'Bronze kiteshield (g)'
	]),
	'Iron trimmed armor': resolveItems([
		'Iron full helm (t)',
		'Iron platebody (t)',
		'Iron platelegs (t)',
		'Iron plateskirt (t)',
		'Iron kiteshield (t)',
		'Iron full helm (g)',
		'Iron platebody (g)',
		'Iron platelegs (g)',
		'Iron plateskirt (g)',
		'Iron kiteshield (g)'
	]),
	'Steel trimmed armor': resolveItems([
		'Steel full helm (t)',
		'Steel platebody (t)',
		'Steel platelegs (t)',
		'Steel plateskirt (t)',
		'Steel kiteshield (t)',
		'Steel full helm (g)',
		'Steel platebody (g)',
		'Steel platelegs (g)',
		'Steel plateskirt (g)',
		'Steel kiteshield (g)'
	]),
	'Black trimmed armor': resolveItems([
		'Black full helm (t)',
		'Black platebody (t)',
		'Black platelegs (t)',
		'Black plateskirt (t)',
		'Black kiteshield (t)',
		'Black full helm (g)',
		'Black platebody (g)',
		'Black platelegs (g)',
		'Black plateskirt (g)',
		'Black kiteshield (g)'
	]),
	'Wizard robes trimmed': resolveItems([
		'Blue wizard hat (t)',
		'Blue wizard robe (t)',
		'Blue skirt (t)',
		'Blue wizard hat (g)',
		'Blue wizard robe (g)',
		'Blue skirt (g)',
		'Black wizard hat (t)',
		'Black wizard robe (t)',
		'Black skirt (t)',
		'Black wizard hat (g)',
		'Black wizard robe (g)',
		'Black skirt (g)'
	]),
	'Leather armour trimmed': resolveItems([
		'Studded body (t)',
		'Studded chaps (t)',
		'Studded body (g)',
		'Studded chaps (g)',
		'Leather body (g)',
		'Leather chaps (g)'
	]),

	'Easy misc. headwear': resolveItems([
		'Black beret',
		'Blue beret',
		'White beret',
		'Red beret',
		'Highwayman mask',
		'Beanie',
		'Imp mask',
		'Goblin mask'
	]),

	'Black heraldic armour': resolveItems([
		'Black helm (h1)',
		'Black helm (h2)',
		'Black helm (h3)',
		'Black helm (h4)',
		'Black helm (h5)',
		'Black platebody (h1)',
		'Black platebody (h2)',
		'Black platebody (h3)',
		'Black platebody (h4)',
		'Black platebody (h5)'
	]),
	'Black heraldic armour 2': resolveItems([
		'Black shield (h1)',
		'Black shield (h2)',
		'Black shield (h3)',
		'Black shield (h4)',
		'Black shield (h5)'
	]),
	'Easy Elegant clothing': resolveItems([
		'Blue elegant shirt',
		'Blue elegant legs',
		'Blue elegant blouse',
		'Blue elegant skirt',
		'Green elegant shirt',
		'Green elegant legs',
		'Green elegant blouse',
		'Green elegant skirt',
		'Red elegant shirt',
		'Red elegant legs',
		'Red elegant blouse',
		'Red elegant skirt'
	]),
	'Easy Vestiment gear': resolveItems([
		'Guthix robe top',
		'Guthix robe legs',
		'Saradomin robe top',
		'Saradomin robe legs',
		'Zamorak robe top',
		'Zamorak robe legs',
		'Ancient robe top',
		'Ancient robe legs',
		'Bandos robe top',
		'Bandos robe legs',
		'Armadyl robe top',
		'Armadyl robe legs'
	]),
	'Easy misc. 1': resolveItems([
		"Bob's red shirt",
		"Bob's blue shirt",
		"Bob's green shirt",
		"Bob's black shirt",
		"Bob's purple shirt",
		'Staff of bob the cat',
		'A powdered wig',
		'Flared trousers',
		'Pantaloons',
		'Sleeping cap',
		'Amulet of magic (t)',
		'Amulet of power (t)'
	]),
	'Easy misc. 2': resolveItems([
		'Team cape i',
		'Team cape x',
		'Team cape zero',
		'Rain bow',
		'Willow comp bow',
		'Ham joint',
		'Black cane',
		'Black pickaxe',
		'Cape of skulls'
	]),
	'Easy gilded items': resolveItems([
		'Wooden shield (g)',
		"Golden chef's hat",
		'Golden apron',
		"Monk's robe top (g)",
		"Monk's robe (g)"
	])
};

export const cluesMedium: CollectionLogData = {
	'Mithril trimmed armor': resolveItems([
		'Mithril full helm (t)',
		'Mithril platebody (t)',
		'Mithril platelegs (t)',
		'Mithril plateskirt (t)',
		'Mithril kiteshield (t)',
		'Mithril full helm (g)',
		'Mithril platebody (g)',
		'Mithril platelegs (g)',
		'Mithril plateskirt (g)',
		'Mithril kiteshield (g)'
	]),
	'Adamant trimmed armor': resolveItems([
		'Adamant full helm (t)',
		'Adamant platebody (t)',
		'Adamant platelegs (t)',
		'Adamant plateskirt (t)',
		'Adamant kiteshield (t)',
		'Adamant full helm (g)',
		'Adamant platebody (g)',
		'Adamant platelegs (g)',
		'Adamant plateskirt (g)',
		'Adamant kiteshield (g)'
	]),
	"Green d'hide trimmed": resolveItems([
		"Green d'hide body (t)",
		"Green d'hide chaps (t)",
		"Green d'hide body (g)",
		"Green d'hide chaps (g)"
	]),
	Headbands: resolveItems([
		'Red headband',
		'Black headband',
		'Brown headband',
		'White headband',
		'Blue headband',
		'Gold headband',
		'Pink headband',
		'Green headband'
	]),
	Boaters: resolveItems([
		'Red boater',
		'Orange boater',
		'Green boater',
		'Blue boater',
		'Black boater',
		'Pink boater',
		'Purple boater',
		'White boater'
	]),
	'Medium boots': resolveItems([
		'Climbing boots (g)',
		'Spiked manacles',
		'Ranger boots',
		'Holy sandals',
		'Wizard boots'
	]),
	'Adamant heraldic armour': resolveItems([
		'Adamant helm (h1)',
		'Adamant helm (h2)',
		'Adamant helm (h3)',
		'Adamant helm (h4)',
		'Adamant helm (h5)',
		'Adamant platebody (h1)',
		'Adamant platebody (h2)',
		'Adamant platebody (h3)',
		'Adamant platebody (h4)',
		'Adamant platebody (h5)'
	]),
	'Adamant heraldic armour 2': resolveItems([
		'Adamant shield (h1)',
		'Adamant shield (h2)',
		'Adamant shield (h3)',
		'Adamant shield (h4)',
		'Adamant shield (h5)'
	]),
	'Medium Elegant clothing': resolveItems([
		'Black elegant shirt',
		'Black elegant legs',
		'White elegant blouse',
		'White elegant skirt',
		'Purple elegant shirt',
		'Purple elegant legs',
		'Purple elegant blouse',
		'Purple elegant skirt',
		'Pink elegant shirt',
		'Pink elegant legs',
		'Pink elegant blouse',
		'Pink elegant skirt'
	]),
	'Medium Elegant clothing 2': resolveItems([
		'Gold elegant shirt',
		'Gold elegant legs',
		'Gold elegant blouse',
		'Gold elegant skirt'
	]),
	'Medium Vestiment gear': resolveItems([
		'Guthix mitre',
		'Guthix cloak',
		'Saradomin mitre',
		'Saradomin cloak',
		'Zamorak mitre',
		'Zamorak cloak',
		'Ancient mitre',
		'Ancient cloak',
		'Bandos mitre',
		'Bandos cloak',
		'Armadyl mitre',
		'Armadyl cloak'
	]),
	'Medium Vestiment gear 2': resolveItems([
		'Ancient stole',
		'Ancient crozier',
		'Armadyl stole',
		'Armadyl crozier',
		'Bandos stole',
		'Bandos crozier'
	]),
	'Medium misc.': resolveItems([
		'Wolf mask',
		'Wolf cloak',
		'Strength amulet (t)',
		'Adamant cane',
		'Cat mask',
		'Penguin mask',
		'Gnomish firelighter',
		'Crier hat',
		'Crier bell',
		'Crier coat',
		'Leprechaun hat',
		'Black leprechaun hat'
	]),
	'Medium misc. 2': resolveItems([
		'Black unicorn mask',
		'White unicorn mask',
		'Arceuus banner',
		'Hosidius banner',
		'Lovakengj banner',
		'Piscarilius banner',
		'Shayzien banner',
		'Cabbage round shield',
		'Yew comp bow'
	])
};

export const cluesHard: CollectionLogData = {
	'Hard ornament kits': resolveItems([
		'Dragon boots ornament kit',
		'Tzhaar-ket-om ornament kit',
		'Berserker necklace ornament kit',
		'Rune defender ornament kit'
	]),
	'Rune trimmed armor': resolveItems([
		'Rune full helm (g)',
		'Rune platebody (g)',
		'Rune platelegs (g)',
		'Rune plateskirt (g)',
		'Rune kiteshield (g)',
		'Rune full helm (t)',
		'Rune platebody (t)',
		'Rune platelegs (t)',
		'Rune plateskirt (t)',
		'Rune kiteshield (t)'
	]),
	'Rune god armour': resolveItems([
		'Guthix full helm',
		'Guthix platebody',
		'Guthix platelegs',
		'Guthix plateskirt',
		'Guthix kiteshield',
		'Saradomin full helm',
		'Saradomin platebody',
		'Saradomin platelegs',
		'Saradomin plateskirt',
		'Saradomin kiteshield'
	]),
	'Rune god armour 2': resolveItems([
		'Zamorak full helm',
		'Zamorak platebody',
		'Zamorak platelegs',
		'Zamorak plateskirt',
		'Zamorak kiteshield',
		'Ancient full helm',
		'Ancient platebody',
		'Ancient platelegs',
		'Ancient plateskirt',
		'Ancient kiteshield'
	]),
	'Rune god armour 3': resolveItems([
		'Armadyl full helm',
		'Armadyl platebody',
		'Armadyl platelegs',
		'Armadyl plateskirt',
		'Armadyl kiteshield',
		'Bandos full helm',
		'Bandos platebody',
		'Bandos platelegs',
		'Bandos plateskirt',
		'Bandos kiteshield'
	]),
	'Rune heraldic armour': resolveItems([
		'Rune helm (h1)',
		'Rune helm (h2)',
		'Rune helm (h3)',
		'Rune helm (h4)',
		'Rune helm (h5)',
		'Rune platebody (h1)',
		'Rune platebody (h2)',
		'Rune platebody (h3)',
		'Rune platebody (h4)',
		'Rune platebody (h5)'
	]),
	'Rune heraldic armour 2': resolveItems([
		'Rune shield (h1)',
		'Rune shield (h2)',
		'Rune shield (h3)',
		'Rune shield (h4)',
		'Rune shield (h5)'
	]),
	"Blue and Red d'hide trimmed": resolveItems([
		"Blue d'hide body (t)",
		"Blue d'hide chaps (g)",
		"Blue d'hide body (g)",
		"Blue d'hide chaps (t)",
		"Red d'hide body (t)",
		"Red d'hide chaps (t)",
		"Red d'hide body (g)",
		"Red d'hide chaps (g)"
	]),
	'Enchanted robes': resolveItems(['Enchanted hat', 'Enchanted top', 'Enchanted robe']),
	"Blessed d'hide": resolveItems([
		'Guthix coif',
		"Guthix d'hide body",
		'Guthix chaps',
		'Guthix bracers',
		"Guthix d'hide boots",
		"Guthix d'hide shield",
		'Saradomin coif',
		"Saradomin d'hide body",
		'Saradomin chaps',
		'Saradomin bracers',
		"Saradomin d'hide boots",
		"Saradomin d'hide shield"
	]),
	"Blessed d'hide 2": resolveItems([
		'Zamorak coif',
		"Zamorak d'hide body",
		'Zamorak chaps',
		'Zamorak bracers',
		"Zamorak d'hide boots",
		"Zamorak d'hide shield",
		'Armadyl coif',
		"Armadyl d'hide body",
		'Armadyl chaps',
		'Armadyl bracers',
		"Armadyl d'hide boots",
		"Armadyl d'hide shield"
	]),
	"Blessed d'hide 3": resolveItems([
		'Ancient coif',
		"Ancient d'hide body",
		'Ancient chaps',
		'Ancient bracers',
		"Ancient d'hide boots",
		"Ancient d'hide shield",
		'Bandos coif',
		"Bandos d'hide body",
		'Bandos chaps',
		'Bandos bracers',
		"Bandos d'hide boots",
		"Bandos d'hide shield"
	]),
	'Hard Vestiment gear': resolveItems([
		'Guthix stole',
		'Guthix crozier',
		'Saradomin stole',
		'Saradomin crozier',
		'Zamorak stole',
		'Zamorak crozier'
	]),
	'Hard misc.': resolveItems([
		'Green dragon mask',
		'Blue dragon mask',
		'Red dragon mask',
		'Black dragon mask',
		'Cyclops head',
		'Tan cavalier',
		'Dark cavalier',
		'Black cavalier',
		'Red cavalier',
		'White cavalier',
		'Navy cavalier',
		"Pirate's hat"
	]),
	'Hard misc.  2': resolveItems([
		'Pith helmet',
		'Robin hood hat',
		'Magic comp bow',
		'Magic longbow',
		'Magic shortbow',
		'Amulet of glory (t4)',
		'Explorer backpack',
		'Thieving bag',
		'Nunchaku',
		'Dual sai',
		'Rune cane',
		19912 // Zombie head
	]),
	'3rd Age Melee': resolveItems([
		'3rd age full helmet',
		'3rd age platebody',
		'3rd age platelegs',
		'3rd age plateskirt',
		'3rd age kiteshield'
	]),
	'3rd Age Mage': resolveItems([
		'3rd age mage hat',
		'3rd age robe top',
		'3rd age robe',
		'3rd age amulet'
	]),
	'3rd Age Range': resolveItems([
		'3rd age longsword',
		'3rd age range coif',
		'3rd age range top',
		'3rd age range legs',
		'3rd age vambraces'
	]),
	Gilded: resolveItems([
		'Gilded full helm',
		'Gilded med helm',
		'Gilded platebody',
		'Gilded chainbody',
		'Gilded platelegs',
		'Gilded plateskirt',
		'Gilded kiteshield',
		'Gilded sq shield',
		'Gilded 2h sword',
		'Gilded spear',
		'Gilded hasta'
	])
};

export const cluesElite: CollectionLogData = {
	'Elite ornament kits': resolveItems([
		'Dragon full helm ornament kit',
		'Dragon chainbody ornament kit',
		'Dragon legs/skirt ornament kit',
		'Dragon sq shield ornament kit',
		'Dragon scimitar ornament kit',
		'Light infinity colour kit',
		'Dark infinity colour kit',
		'Fury ornament kit'
	]),
	'Royal and muskateer sets': resolveItems([
		'Royal crown',
		'Royal gown top',
		'Royal gown bottom',
		'Royal sceptre',
		'Musketeer hat',
		'Musketeer tabard',
		'Musketeer pants'
	]),
	"Black d'hide trimmed": resolveItems([
		"Black d'hide body (t)",
		"Black d'hide chaps (t)",
		"Black d'hide body (g)",
		"Black d'hide chaps (g)"
	]),
	'Tuxedo sets': resolveItems([
		'Dark bow tie',
		'Dark tuxedo jacket',
		'Dark tuxedo cuffs',
		'Dark trousers',
		'Dark tuxedo shoes',
		'Light bow tie',
		'Light tuxedo jacket',
		'Light tuxedo cuffs',
		'Light trousers',
		'Light tuxedo shoes'
	]),
	'Elite misc 1': resolveItems([
		'Bronze dragon mask',
		'Iron dragon mask',
		'Steel dragon mask',
		'Mithril dragon mask',
		'Adamant dragon mask',
		'Rune dragon mask',
		'Lava dragon mask',
		'Giant boot',
		"Uri's hat",
		'Afro',
		'Big pirate hat',
		'Deerstalker'
	]),
	'Elite misc 2': resolveItems([
		'Top hat',
		'Sagacious spectacles',
		'Monocle',
		"Blacksmith's helm",
		'Bucket helm',
		"Rangers' tunic",
		"Rangers' tights",
		'Ranger gloves',
		'Holy wraps',
		'Fremennik kilt',
		'Ring of nature',
		'Katana'
	]),
	'Elite misc 3': resolveItems([
		'Dragon cane',
		'Briefcase',
		'Arceuus scarf',
		'Hosidius scarf',
		'Lovakengj scarf',
		'Piscarilius scarf',
		'Shayzien scarf'
	]),
	'3rd Age Melee': resolveItems([
		'3rd age full helmet',
		'3rd age platebody',
		'3rd age platelegs',
		'3rd age plateskirt',
		'3rd age kiteshield'
	]),
	'3rd Age Mage': resolveItems([
		'3rd age mage hat',
		'3rd age robe top',
		'3rd age robe',
		'3rd age amulet'
	]),
	'3rd Age Range': resolveItems([
		'3rd age range coif',
		'3rd age range top',
		'3rd age range legs',
		'3rd age vambraces'
	]),
	'3rd Age Weapons and cloak': resolveItems([
		'3rd age longsword',
		'3rd age wand',
		'3rd age bow',
		'3rd age cloak'
	]),
	Gilded: resolveItems([
		'Gilded full helm',
		'Gilded med helm',
		'Gilded platebody',
		'Gilded chainbody',
		'Gilded platelegs',
		'Gilded plateskirt',
		'Gilded kiteshield',
		'Gilded sq shield',
		'Gilded boots'
	]),
	'Gilded 2': resolveItems([
		'Gilded coif',
		"Gilded d'hide body",
		"Gilded d'hide chaps",
		"Gilded d'hide vambraces",
		'Gilded 2h sword',
		'Gilded spear',
		'Gilded hasta'
	]),
	'Gilded elite/master only': resolveItems([
		'Gilded scimitar',
		'Gilded pickaxe',
		'Gilded axe',
		'Gilded spade'
	])
};

export const cluesMaster: CollectionLogData = {
	'Samurai and Mummy sets': resolveItems([
		'Samurai kasa',
		'Samurai shirt',
		'Samurai gloves',
		'Samurai greaves',
		'Samurai boots',
		"Mummy's head",
		"Mummy's body",
		"Mummy's hands",
		"Mummy's legs",
		"Mummy's feet"
	]),
	'Ankou set and robes of darkness': resolveItems([
		'Ankou mask',
		'Ankou top',
		'Ankou gloves',
		"Ankou's leggings",
		'Ankou socks',
		'Hood of darkness',
		'Robe top of darkness',
		'Gloves of darkness',
		'Robe bottom of darkness',
		'Boots of darkness'
	]),
	'Master ornament kits': resolveItems([
		'Torture ornament kit',
		'Occult ornament kit',
		'Tormented ornament kit',
		'Armadyl godsword ornament kit',
		'Bandos godsword ornament kit',
		'Saradomin godsword ornament kit',
		'Zamorak godsword ornament kit',
		'Dragon defender ornament kit',
		'Dragon kiteshield ornament kit',
		'Anguish ornament kit',
		'Dragon platebody ornament kit'
	]),
	'Master misc.': resolveItems([
		'Bloodhound',
		'Fancy tiara',
		'Ring of coins',
		'Lesser demon mask',
		'Greater demon mask',
		'Black demon mask',
		'Old demon mask',
		'Jungle demon mask',
		'Obsidian cape (r)',
		'Half moon spectacles',
		'Ale of the gods',
		'Bucket helm (g)'
	]),
	'Master misc. 2': resolveItems([
		'Bowl wig',
		'Left eye patch',
		'Arceuus hood',
		'Hosidius hood',
		'Lovakengj hood',
		'Piscarilius hood',
		'Shayzien hood'
	]),
	'3rd Age Melee': resolveItems([
		'3rd age full helmet',
		'3rd age platebody',
		'3rd age platelegs',
		'3rd age plateskirt',
		'3rd age kiteshield'
	]),
	'3rd Age Mage': resolveItems([
		'3rd age mage hat',
		'3rd age robe top',
		'3rd age robe',
		'3rd age amulet'
	]),
	'3rd Age Range': resolveItems([
		'3rd age range coif',
		'3rd age range top',
		'3rd age range legs',
		'3rd age vambraces'
	]),
	'3rd Age Weapons and cloak': resolveItems([
		'3rd age longsword',
		'3rd age wand',
		'3rd age bow',
		'3rd age cloak'
	]),
	'3rd Age Druidic and Tools': resolveItems([
		'3rd age druidic cloak',
		'3rd age druidic robe top',
		'3rd age druidic robe bottoms',
		'3rd age druidic staff',
		'3rd age axe',
		'3rd age pickaxe'
	]),
	Gilded: resolveItems([
		'Gilded full helm',
		'Gilded med helm',
		'Gilded platebody',
		'Gilded chainbody',
		'Gilded platelegs',
		'Gilded plateskirt',
		'Gilded kiteshield',
		'Gilded sq shield',
		'Gilded boots'
	]),
	'Gilded 2': resolveItems([
		'Gilded coif',
		"Gilded d'hide body",
		"Gilded d'hide chaps",
		"Gilded d'hide vambraces",
		'Gilded 2h sword',
		'Gilded spear',
		'Gilded hasta'
	]),
	'Gilded elite/master only': resolveItems([
		'Gilded scimitar',
		'Gilded pickaxe',
		'Gilded axe',
		'Gilded spade'
	])
};

export const cluesRares: CollectionLogData = {
	'3rd Age Melee': resolveItems([
		'3rd age full helmet',
		'3rd age platebody',
		'3rd age platelegs',
		'3rd age plateskirt',
		'3rd age kiteshield'
	]),
	'3rd Age Mage': resolveItems([
		'3rd age mage hat',
		'3rd age robe top',
		'3rd age robe',
		'3rd age amulet'
	]),
	'3rd Age Range': resolveItems([
		'3rd age range coif',
		'3rd age range top',
		'3rd age range legs',
		'3rd age vambraces'
	]),
	'3rd Age Weapons and cloak': resolveItems([
		'3rd age longsword',
		'3rd age wand',
		'3rd age bow',
		'3rd age cloak'
	]),
	'3rd Age Druidic and Tools': resolveItems([
		'3rd age druidic cloak',
		'3rd age druidic robe top',
		'3rd age druidic robe bottoms',
		'3rd age druidic staff',
		'3rd age axe',
		'3rd age pickaxe'
	]),
	'3rd Age Ring': resolveItems(['Ring of 3rd age']),
	Gilded: resolveItems([
		'Gilded full helm',
		'Gilded med helm',
		'Gilded platebody',
		'Gilded chainbody',
		'Gilded platelegs',
		'Gilded plateskirt',
		'Gilded kiteshield',
		'Gilded sq shield',
		'Gilded boots'
	]),
	'Gilded 2': resolveItems([
		'Gilded coif',
		"Gilded d'hide body",
		"Gilded d'hide chaps",
		"Gilded d'hide vambraces",
		'Gilded 2h sword',
		'Gilded spear',
		'Gilded hasta'
	]),
	'Gilded elite/master only': resolveItems([
		'Gilded scimitar',
		'Gilded pickaxe',
		'Gilded axe',
		'Gilded spade'
	])
};

export const cluesAll: CollectionLogData = {
	...cluesShared,
	...cluesRares,
	...cluesBeginner,
	...cluesEasy,
	...cluesMedium,
	...cluesHard,
	...cluesElite,
	...cluesMaster
};

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

export const championScrollLog: CollectionLogData = {
	'Champion scrolls': championScrolls,
	Cape: resolveItems(["Champion's cape"])
};
export const holiday: CollectionLogData = {
	'Birthday Event': resolveItems([
		'Cow mask',
		'Cow top',
		'Cow trousers',
		'Cow gloves',
		'Cow shoes',
		'Slice of birthday cake'
	]),
	'Easter Event': resolveItems(['Bunny ears', 'Easter egg']),
	'Halloween Event': resolveItems([
		'Pumpkin',
		'Scythe',
		'Red halloween mask',
		'Blue halloween mask',
		'Green halloween mask',
		'Skeleton mask',
		'Skeleton shirt',
		'Skeleton leggings',
		'Skeleton gloves',
		'Skeleton boots'
	]),
	Christmas: resolveItems([
		'Santa mask',
		'Santa jacket',
		'Santa pantaloons',
		'Santa gloves',
		'Santa boots',
		'Sack of presents',
		'Christmas cracker',
		'Santa hat'
	])
};

export const diangoCollectionLog: CollectionLogData = {
	Common: resolveItems([
		'Event rpg',
		'Green banner',
		'Spinning plate',
		'Brown toy horsey',
		'White toy horsey',
		'Black toy horsey',
		'Grey toy horsey',
		11705,
		11706
	]),
	Uncommon: resolveItems([
		'Tiger toy',
		'Lion toy',
		'Snow leopard toy',
		'Amur leopard toy',
		'Holy handegg',
		'Peaceful handegg',
		'Chaotic handegg',
		'Rainbow scarf',
		"Diango's claws"
	]),
	Rare: resolveItems([
		'Hornwood helm',
		'Hand fan',
		'Mask of balance',
		'Druidic wreath',
		'Disk of returning'
	]),
	Other: resolveItems(['Mystery box', 'Stale baguette'])
};

export const capes: CollectionLogData = {
	hoods1: resolveItems([
		'Mining hood',
		'Smithing hood',
		'Woodcutting hood',
		'Firemaking hood',
		'Fishing hood',
		'Agility hood',
		'Cooking hood',
		'Crafting hood',
		'Prayer hood',
		'Fletching hood',
		'Runecraft hood',
		'Thieving hood'
	]),
	capes: resolveItems([
		'Mining cape',
		'Smithing cape',
		'Woodcutting cape',
		'Firemaking cape',
		'Fishing cape',
		'Agility cape',
		'Cooking cape',
		'Crafting cape',
		'Prayer cape',
		'Fletching cape',
		'Runecraft cape',
		'Thieving cape'
	]),
	'trimmed capes': resolveItems([
		'Mining cape(t)',
		'Smithing cape(t)',
		'Woodcut. cape(t)',
		'Firemaking cape(t)',
		'Fishing cape(t)',
		'Agility cape(t)',
		'Cooking cape(t)',
		'Crafting cape(t)',
		'Prayer cape(t)',
		'Fletching cape(t)',
		'Runecraft cape(t)',
		'Thieving cape(t)'
	]),
	hoods2: resolveItems(['Farming hood', 'Herblore hood', 'Hunter hood', 'Quest point hood']),
	capes2: resolveItems(['Farming cape', 'Herblore cape', 'Hunter cape', 'Quest point cape']),
	'trimmed capes2': resolveItems([
		'Farming cape(t)',
		'Herblore cape(t)',
		'Hunter cape(t)',
		'Quest point cape (t)'
	])
};

export const quest: CollectionLogData = {
	various: resolveItems([
		'Quest point hood',
		'Quest point cape',
		'Helm of neitiznot',
		'Anti-dragon shield',
		'Goldsmith gauntlets',
		'Cooking gauntlets',
		'Magic secateurs'
	]),
	gloves: resolveItems([
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
	])
};

export const wintertodt: CollectionLogData = {
	'': wintertodtLog
};

export const coxLog: CollectionLogData = {
	Misc: resolveItems([
		'Dexterous prayer scroll',
		'Torn prayer scroll',
		'Arcane prayer scroll',
		'Dark relic'
	]),
	Weapons: resolveItems([
		'Twisted bow',
		'Elder maul',
		'Kodai insignia',
		'Dragon hunter crossbow',
		'Dragon claws'
	]),
	Armor: resolveItems([
		'Ancestral hat',
		'Ancestral robe top',
		'Ancestral robe bottom',
		'Twisted buckler',
		"Dinh's bulwark"
	]),
	Others: resolveItems([
		'Metamorphic dust',
		'Olmlet',

		"Xeric's guard",
		"Xeric's warrior",
		"Xeric's sentinel",
		"Xeric's general",
		"Xeric's champion"
	])
};

export const miscLog: CollectionLogData = {
	'God Books': resolveItems([
		'Holy book',
		'Unholy book',
		'Book of war',
		'Book of balance',
		'Book of darkness',
		'Book of law'
	]),
	Tzhaar: resolveItems(['Fire cape'])
};

export const sepulchreLog: CollectionLogData = {
	Misc: resolveItems([
		'Hallowed mark',
		'Hallowed token',
		'Hallowed grapple',
		'Hallowed focus',
		'Hallowed symbol',
		'Hallowed hammer'
	]),
	Misc2: resolveItems([
		'Hallowed ring',
		'Dark dye',
		'Dark acorn',
		'Strange old lockpick',
		'Ring of endurance (uncharged)'
	]),
	Graceful: resolveItems([
		'Dark graceful hood',
		'Dark graceful top',
		'Dark graceful legs',
		'Dark graceful boots',
		'Dark graceful gloves',
		'Dark graceful cape'
	]),
	Pets: resolveItems(['Giant squirrel', 'Dark squirrel'])
};

export const skillingLog: CollectionLogData = {
	Mining: resolveItems([
		'Prospector helmet',
		'Prospector jacket',
		'Prospector legs',
		'Prospector boots',
		'Mining gloves',
		'Superior mining gloves',
		'Expert mining gloves',
		'Golden nugget',
		'Unidentified minerals',
		'Rock golem'
	]),
	Fishing: resolveItems(['Big swordfish', 'Big shark', 'Big bass', 'Heron']),
	Agility: resolveItems([...gracefulItems, 'Mark of grace', 'Giant squirrel']),
	MonkeyBackpacks: Agility.MonkeyBackpacks.map(i => i.id),
	Firemaking: wintertodtLog,
	Sepulchre1: resolveItems([
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
		'Ring of endurance (uncharged)'
	]),
	Sepulchre2: resolveItems([
		'Dark graceful hood',
		'Dark graceful top',
		'Dark graceful legs',
		'Dark graceful boots',
		'Dark graceful gloves',
		'Dark graceful cape',
		'Dark squirrel'
	]),
	Angler: anglerOutfit,
	Farmer: farmersOutfit,
	Zalcano: zalcanoLog,
	Plunder: resolveItems(["Pharaoh's sceptre (3)", 'Rocky']),
	AgilityArena: agilityArenaLog,
	Hunter: resolveItems([
		'Graahk headdress',
		'Graahk top',
		'Graahk legs',
		'Kyatt hat',
		'Kyatt top',
		'Kyatt legs',
		'Spotted cape',
		'Spottier cape',
		'Gloves of silence',
		'Golden tench',
		'Baby chinchompa',
		'Herbi'
	])
};

export const allCollectionLogItems = removeDuplicatesFromArray(
	[
		...Object.values(bosses),
		...Object.values(cluesAll),
		...Object.values(pets),
		...Object.values(championScrolls),
		...Object.values(holiday),
		...Object.values(diangoCollectionLog),
		...Object.values(capes),
		...Object.values(quest),
		...Object.values(skillingLog),
		...Object.values(coxLog),
		...Object.values(miscLog),
		...Object.values(nightmareLog),
		...Object.values(sepulchreLog)
	].flat(Infinity)
) as number[];

export type CollectionLogData = Record<string, number[]>;

export interface CollectionLogType {
	name: string;
	aliases: string[];
	items: CollectionLogData;
}

export const collectionLogTypes: CollectionLogType[] = [
	{
		name: 'Overall',
		aliases: ['all', 'overall'],
		items: { '': allCollectionLogItems }
	},
	{
		name: 'Boss',
		aliases: ['bosses', 'boss'],
		items: bosses
	},
	{
		name: 'Clue all',
		aliases: ['clues all', 'clue all'],
		items: cluesAll
	},
	{
		name: 'Clues Shared',
		aliases: ['shared', 'clues shared', 'clue shared'],
		items: cluesShared
	},
	{
		name: 'Clues Beginner',
		aliases: ['beginner', 'clues beginner', 'clue beginner'],
		items: cluesBeginner
	},
	{
		name: 'Clues Easy',
		aliases: ['easy', 'clues easy', 'clue easy'],
		items: cluesEasy
	},
	{
		name: 'Clues Medium',
		aliases: ['medium', 'clues medium', 'clue medium', 'med', 'clues med', 'clue med'],
		items: cluesMedium
	},
	{
		name: 'Clues Hard',
		aliases: ['hard', 'clues hard', 'clue hard'],
		items: cluesHard
	},
	{
		name: 'Clues Elite',
		aliases: ['elite', 'clues elite', 'clue elite'],
		items: cluesElite
	},
	{
		name: 'Clues Master',
		aliases: ['master', 'clues master', 'clue master'],
		items: cluesMaster
	},
	{
		name: 'Clues Rare',
		aliases: ['rare', 'clues rare', 'clue rare'],
		items: cluesRares
	},
	{
		name: 'Pets',
		aliases: ['pet', 'pets'],
		items: pets
	},
	{
		name: 'Champion scroll',
		aliases: ['champion scrolls', 'champion scroll', 'scroll', 'scrolls'],
		items: championScrollLog
	},
	{
		name: 'Holiday',
		aliases: ['holiday', 'holidays'],
		items: holiday
	},
	{
		name: 'Diango',
		aliases: ['diango', 'dailies', 'daily'],
		items: diangoCollectionLog
	},
	{
		name: 'Capes',
		aliases: ['skill capes', 'skill cape', 'skillcapes', 'skillcape', 'capes'],
		items: capes
	},
	{
		name: 'Quest',
		aliases: ['quests', 'q', 'quest'],
		items: quest
	},
	{
		name: 'Skilling',
		aliases: ['s', 'skilling', 'skills'],
		items: skillingLog
	},
	{
		name: 'Chambers of Xeric',
		aliases: ['raids', 'cox'],
		items: coxLog
	},
	{
		name: 'Wintertodt',
		aliases: ['todt', 'wintertodt', 'wt'],
		items: wintertodt
	},
	{
		name: 'Misc',
		aliases: ['misc'],
		items: miscLog
	},
	{
		name: 'Nightmare',
		aliases: ['nightmare', 'the nightmare'],
		items: { nightmare: nightmareLog }
	},
	{
		name: 'Hallowed Sepulchre',
		aliases: ['sepulchre', 'hallowed sepulchre'],
		items: sepulchreLog
	},
	{
		name: 'Fishing Trawler',
		aliases: ['trawler', 'ft', 'fishing trawler'],
		items: fishingTrawler
	},
	{
		name: 'Zalcano',
		aliases: ['zalcano'],
		items: { 1: zalcanoLog }
	},
	{
		name: 'Barrows',
		aliases: ['barrows'],
		items: barrows
	},
	{
		name: 'Barbarian Assault',
		aliases: ['ba', 'barb assault', 'barbarian assault'],
		items: { 1: barbAssaultLog }
	},
	{
		name: 'Agility Arena',
		aliases: ['aa', 'agility arena'],
		items: { 1: agilityArenaLog }
	},
	{
		name: 'Hunter Gear',
		aliases: ['hunter gear'],
		items: hunterGear
	}
];
