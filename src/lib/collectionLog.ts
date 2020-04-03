import { removeDuplicatesFromArray } from './util';
import { transformArrayOfResolvableItems } from './util/transformArrayOfResolvableItems';

export const bosses = {
	Zulrah: transformArrayOfResolvableItems([
		'Uncut onyx',
		'Tanzanite fang',
		'Magic fang',
		'Serpentine visage',
		'Magma mutagen',
		'Tanzanite mutagen',
		'Jar of swamp',
		'Pet snakeling'
	]),
	Shards: transformArrayOfResolvableItems([
		'Godsword shard 1',
		'Godsword shard 2',
		'Godsword shard 3'
	]),
	Zammy: transformArrayOfResolvableItems([
		'Steam battlestaff',
		'Zamorakian spear',
		'Staff of the dead',
		'Zamorak hilt',
		"Pet k'ril tsutsaroth"
	]),
	Bandos: transformArrayOfResolvableItems([
		'Bandos chestplate',
		'Bandos tassets',
		'Bandos boots',
		'Bandos hilt',
		'Pet general graardor'
	]),
	Saradomin: transformArrayOfResolvableItems([
		'Saradomin sword',
		"Saradomin's light",
		'Armadyl crossbow',
		'Saradomin hilt',
		'Pet zilyana'
	]),
	Arma: transformArrayOfResolvableItems([
		'Armadyl helmet',
		'Armadyl chestplate',
		'Armadyl chainskirt',
		'Armadyl hilt',
		"Pet kree'arra"
	]),
	'Corp Beast': transformArrayOfResolvableItems([
		'Spirit shield',
		'Holy elixir',
		'Spectral sigil',
		'Arcane sigil',
		'Elysian sigil',
		'Pet dark core'
	]),
	Cerberus: transformArrayOfResolvableItems([
		'Primordial crystal',
		'Pegasian crystal',
		'Eternal crystal',
		'Smouldering stone',
		'Jar of souls',
		'Hellpuppy'
	]),
	'Dagannoth Kings': transformArrayOfResolvableItems([
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
	Vorkath: transformArrayOfResolvableItems([
		'Dragonbone necklace',
		"Vorkath's head",
		'Skeletal visage',
		'Draconic visage',
		'Jar of decay',
		'Vorki'
	]),
	Barrows: transformArrayOfResolvableItems([
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
	'Barrows 2': transformArrayOfResolvableItems([
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
	]),
	'Giant Mole': transformArrayOfResolvableItems(['Long bone', 'Curved bone', 'Baby mole']),
	'Kalphite queen': transformArrayOfResolvableItems([
		'Dragon chainbody',
		'Dragon 2h sword',
		'Kq head',
		'Jar of sand',
		'Kalphite princess'
	]),
	'Lizardman shaman': transformArrayOfResolvableItems(['Dragon warhammer']),
	/* 'Boss Shared':transformArrayOfResolvableItems([
		'Dragon pickaxe',
		'Dragon 2h sword'
		])*/

	Callisto: transformArrayOfResolvableItems([
		'Dragon pickaxe',
		'Dragon 2h sword',
		'Tyrannical ring',
		'Callisto cub'
	]),
	Venenatis: transformArrayOfResolvableItems([
		'Dragon pickaxe',
		'Dragon 2h sword',
		'Treasonous ring',
		'Venenatis spiderling'
	]),
	Vetion: transformArrayOfResolvableItems([
		'Dragon pickaxe',
		'Dragon 2h sword',
		'Ring of the gods',
		"Vet'ion jr."
	]),
	'King Black Dragon': transformArrayOfResolvableItems([
		'Dragon pickaxe',
		'Dragon med helm',
		'Kbd heads',
		'Draconic visage',
		'Prince black dragon'
	]),
	'Chaos Ele': transformArrayOfResolvableItems([
		'Dragon pickaxe',
		'Dragon 2h sword',
		'Pet chaos elemental'
	]),
	'Chaos Fanatic': transformArrayOfResolvableItems([
		'Malediction shard 1',
		'Odium shard 1',
		'Pet chaos elemental'
	]),
	'Crazy Arch': transformArrayOfResolvableItems([
		'Malediction shard 2',
		'Odium shard 2',
		'Fedora'
	]),
	Scorpia: transformArrayOfResolvableItems([
		'Malediction shard 3',
		'Odium shard 3',
		"Scorpia's offspring"
	])
};
export const pets = {
	'Skilling Pets': transformArrayOfResolvableItems([
		'Heron',
		'Rock golem',
		'Beaver',
		'Baby chinchompa',
		'Giant squirrel',
		'Tangleroot',
		'Rocky',
		'Rift guardian'
	]),
	space1: [],
	'Boss Pets': transformArrayOfResolvableItems([
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
	'Boss Pets 2': transformArrayOfResolvableItems([
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
	'Slayer Boss Pets': transformArrayOfResolvableItems([
		'Noon',
		'Abyssal orphan',
		'Pet kraken',
		'Hellpuppy',
		'Pet smoke devil',
		'Ikkle hydra'
	]),
	space2: [],
	Other: transformArrayOfResolvableItems([
		'Bloodhound',
		'Herbi',
		'Chompy chick',
		'Pet penance queen',
		'Phoenix',
		'Smolcano',
		'Youngllef'
	])
};
export const cluesShared = {
	'God Pages': transformArrayOfResolvableItems([
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
	'God Pages 2': transformArrayOfResolvableItems([
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
	Blessings: transformArrayOfResolvableItems([
		'Holy blessing',
		'Unholy blessing',
		'Peaceful blessing',
		'Honourable blessing',
		'War blessing',
		'Ancient blessing'
	])
};
export const cluesBeginner = {
	'Beginner Clues': transformArrayOfResolvableItems([
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
	'Rune scimitar ornament kits': transformArrayOfResolvableItems([
		'Rune scimitar ornament kit (saradomin)',
		'Rune scimitar ornament kit (guthix)',
		'Rune scimitar ornament kit (zamorak)'
	])
};
export const cluesEasy = {
	'Bronze trimmed armor': transformArrayOfResolvableItems([
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
	'Iron trimmed armor': transformArrayOfResolvableItems([
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
	'Steel trimmed armor': transformArrayOfResolvableItems([
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
	'Black trimmed armor': transformArrayOfResolvableItems([
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
	'Wizard robes trimmed': transformArrayOfResolvableItems([
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
	'Leather armour trimmed': transformArrayOfResolvableItems([
		'Studded body (t)',
		'Studded chaps (t)',
		'Studded body (g)',
		'Studded chaps (g)',
		'Leather body (g)',
		'Leather chaps (g)'
	]),

	'Easy misc. headwear': transformArrayOfResolvableItems([
		'Black beret',
		'Blue beret',
		'White beret',
		'Red beret',
		'Highwayman mask',
		'Beanie',
		'Imp mask',
		'Goblin mask'
	]),

	'Black heraldic armour': transformArrayOfResolvableItems([
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
	'Black heraldic armour 2': transformArrayOfResolvableItems([
		'Black shield (h1)',
		'Black shield (h2)',
		'Black shield (h3)',
		'Black shield (h4)',
		'Black shield (h5)'
	]),
	'Easy Elegant clothing': transformArrayOfResolvableItems([
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
	'Easy Vestiment gear': transformArrayOfResolvableItems([
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
	'Easy misc. 1': transformArrayOfResolvableItems([
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
	'Easy misc. 2': transformArrayOfResolvableItems([
		'Team cape i',
		'Team cape x',
		'Team cape zero',
		'Rain bow',
		'Ham joint',
		'Black cane',
		'Black pickaxe',
		'Cape of skulls'
	]),
	'Easy gilded items': transformArrayOfResolvableItems([
		'Wooden shield (g)',
		"Golden chef's hat",
		'Golden apron',
		"Monk's robe top (g)",
		"Monk's robe (g)"
	])
};
export const cluesMedium = {
	'Mithril trimmed armor': transformArrayOfResolvableItems([
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
	'Adamant trimmed armor': transformArrayOfResolvableItems([
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
	"Green d'hide trimmed": transformArrayOfResolvableItems([
		"Green d'hide body (t)",
		"Green d'hide chaps (t)",
		"Green d'hide body (g)",
		"Green d'hide chaps (g)"
	]),
	Headbands: transformArrayOfResolvableItems([
		'Red headband',
		'Black headband',
		'Brown headband',
		'White headband',
		'Blue headband',
		'Gold headband',
		'Pink headband',
		'Green headband'
	]),
	Boaters: transformArrayOfResolvableItems([
		'Red boater',
		'Orange boater',
		'Green boater',
		'Blue boater',
		'Black boater',
		'Pink boater',
		'Purple boater',
		'White boater'
	]),
	'Medium boots': transformArrayOfResolvableItems([
		'Climbing boots (g)',
		'Spiked manacles',
		'Ranger boots',
		'Holy sandals',
		'Wizard boots'
	]),
	'Adamant heraldic armour': transformArrayOfResolvableItems([
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
	'Adamant heraldic armour 2': transformArrayOfResolvableItems([
		'Adamant shield (h1)',
		'Adamant shield (h2)',
		'Adamant shield (h3)',
		'Adamant shield (h4)',
		'Adamant shield (h5)'
	]),
	'Medium Elegant clothing': transformArrayOfResolvableItems([
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
	'Medium Elegant clothing 2': transformArrayOfResolvableItems([
		'Gold elegant shirt',
		'Gold elegant legs',
		'Gold elegant blouse',
		'Gold elegant skirt'
	]),
	'Medium Vestiment gear': transformArrayOfResolvableItems([
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
	'Medium Vestiment gear 2': transformArrayOfResolvableItems([
		'Ancient stole',
		'Ancient crozier',
		'Armadyl stole',
		'Armadyl crozier',
		'Bandos stole',
		'Bandos crozier'
	]),
	'Medium misc.': transformArrayOfResolvableItems([
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
	'Medium misc. 2': transformArrayOfResolvableItems([
		'Black unicorn mask',
		'White unicorn mask',
		'Arceuus banner',
		'Hosidius banner',
		'Lovakengj banner',
		'Piscarilius banner',
		'Shayzien banner',
		'Cabbage round shield'
	])
};
export const cluesHard = {
	'Hard ornament kits': transformArrayOfResolvableItems([
		'Dragon boots ornament kit',
		'Tzhaar-ket-om ornament kit',
		'Berserker necklace ornament kit',
		'Rune defender ornament kit'
	]),
	'Rune trimmed armor': transformArrayOfResolvableItems([
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
	'Rune god armour': transformArrayOfResolvableItems([
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
	'Rune god armour 2': transformArrayOfResolvableItems([
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
	'Rune god armour 3': transformArrayOfResolvableItems([
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
	'Rune heraldic armour': transformArrayOfResolvableItems([
		'Rune helm (h1)',
		'Rune helm (h2)',
		'Rune helm (h3)',
		'Rune helm (h4)',
		'Rune helm (h5)',
		'Rune shield (h1)',
		'Rune shield (h2)',
		'Rune shield (h3)',
		'Rune shield (h4)',
		'Rune shield (h5)'
	]),
	"Blue and Red d'hide trimmed": transformArrayOfResolvableItems([
		"Blue d'hide body (t)",
		"Blue d'hide chaps (g)",
		"Blue d'hide body (g)",
		"Blue d'hide chaps (t)",
		"Red d'hide body (t)",
		"Red d'hide chaps (t)",
		"Red d'hide body (g)",
		"Red d'hide chaps (g)"
	]),
	'Enchanted robes': transformArrayOfResolvableItems([
		'Enchanted hat',
		'Enchanted top',
		'Enchanted robe'
	]),
	"Blessed d'hide": transformArrayOfResolvableItems([
		'Guthix coif',
		"Guthix d'hide",
		'Guthix chaps',
		'Guthix bracers',
		"Guthix d'hide boots",
		"Guthix d'hide shield",
		'Saradomin coif',
		"Saradomin d'hide",
		'Saradomin chaps',
		'Saradomin bracers',
		"Saradomin d'hide boots",
		"Saradomin d'hide shield"
	]),
	"Blessed d'hide 2": transformArrayOfResolvableItems([
		'Zamorak coif',
		"Zamorak d'hide",
		'Zamorak chaps',
		'Zamorak bracers',
		"Zamorak d'hide boots",
		"Zamorak d'hide shield",
		'Armadyl coif',
		"Armadyl d'hide",
		'Armadyl chaps',
		'Armadyl bracers',
		"Armadyl d'hide boots",
		"Armadyl d'hide shield"
	]),
	"Blessed d'hide 3": transformArrayOfResolvableItems([
		'Ancient coif',
		"Ancient d'hide",
		'Ancient chaps',
		'Ancient bracers',
		"Ancient d'hide boots",
		"Ancient d'hide shield",
		'Bandos coif',
		"Bandos d'hide",
		'Bandos chaps',
		'Bandos bracers',
		"Bandos d'hide boots",
		"Bandos d'hide shield"
	]),

	'Hard Vestiment gear': transformArrayOfResolvableItems([
		'Guthix stole',
		'Guthix crozier',
		'Saradomin stole',
		'Saradomin crozier',
		'Zamorak stole',
		'Zamorak crozier'
	]),
	'Hard misc.': transformArrayOfResolvableItems([
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
	'Hard misc.  2': transformArrayOfResolvableItems([
		'Pith helmet',
		'Robin hood hat',
		'Magic longbow',
		'Magic shortbow',
		'Amulet of glory (t4)',
		'Explorer backpack',
		'Nunchaku',
		'Rune cane',
		'Zombie head'
	]),
	'3rd Age Melee': transformArrayOfResolvableItems([
		'3rd age full helmet',
		'3rd age platebody',
		'3rd age platelegs',
		'3rd age plateskirt',
		'3rd age kiteshield'
	]),
	'3rd Age Mage': transformArrayOfResolvableItems([
		'3rd age mage hat',
		'3rd age robe top',
		'3rd age robe',
		'3rd age amulet'
	]),
	'3rd Age Range': transformArrayOfResolvableItems([
		'3rd age longsword',
		'3rd age range coif',
		'3rd age range top',
		'3rd age range legs',
		'3rd age vambraces'
	]),
	Gilded: transformArrayOfResolvableItems([
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
	'Gilded 2': transformArrayOfResolvableItems([
		'Gilded coif',
		"Gilded d'hide body",
		"Gilded d'hide chaps",
		"Gilded d'hide vambs",
		'Gilded 2h sword',
		'Gilded spear',
		'Gilded hasta'
	])
};
export const cluesElite = {
	'Elite ornament kits': transformArrayOfResolvableItems([
		'Dragon full helm ornament kit',
		'Dragon chainbody ornament kit',
		'Dragon legs/skirt ornament kit',
		'Dragon sq shield ornament kit',
		'Dragon scimitar ornament kit',
		'Light infinity colour kit',
		'Dark infinity colour kit',
		'Fury ornament kit'
	]),
	'Royal and muskateer sets': transformArrayOfResolvableItems([
		'Royal crown',
		'Royal gown top',
		'Royal gown bottom',
		'Royal sceptre',
		'Musketeer hat',
		'Musketeer tabard',
		'Musketeer pants'
	]),
	"Black d'hide trimmed": transformArrayOfResolvableItems([
		"Black d'hide body (t)",
		"Black d'hide chaps (t)",
		"Black d'hide body (g)",
		"Black d'hide chaps (g)"
	]),

	'Tuxedo sets': transformArrayOfResolvableItems([
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
	'Elite misc 1': transformArrayOfResolvableItems([
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
	'Elite misc 2': transformArrayOfResolvableItems([
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
	'Elite misc 3': transformArrayOfResolvableItems([
		'Dragon cane',
		'Briefcase',
		'Arceuus scarf',
		'Hosidius scarf',
		'Lovakengj scarf',
		'Piscarilius scarf',
		'Shayzien scarf'
	]),
	'3rd Age Melee': transformArrayOfResolvableItems([
		'3rd age full helmet',
		'3rd age platebody',
		'3rd age platelegs',
		'3rd age plateskirt',
		'3rd age kiteshield'
	]),
	'3rd Age Mage': transformArrayOfResolvableItems([
		'3rd age mage hat',
		'3rd age robe top',
		'3rd age robe',
		'3rd age amulet'
	]),
	'3rd Age Range': transformArrayOfResolvableItems([
		'3rd age range coif',
		'3rd age range top',
		'3rd age range legs',
		'3rd age vambraces'
	]),
	'3rd Age Weapons and cloak': transformArrayOfResolvableItems([
		'3rd age longsword',
		'3rd age wand',
		'3rd age bow',
		'3rd age cloak'
	]),
	Gilded: transformArrayOfResolvableItems([
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
	'Gilded 2': transformArrayOfResolvableItems([
		'Gilded coif',
		"Gilded d'hide body",
		"Gilded d'hide chaps",
		"Gilded d'hide vambs",
		'Gilded 2h sword',
		'Gilded spear',
		'Gilded hasta'
	]),
	'Gilded elite/master only': transformArrayOfResolvableItems([
		'Gilded scimitar',
		'Gilded pickaxe',
		'Gilded axe',
		'Gilded spade'
	])
};
export const cluesMaster = {
	'Samurai and Mummy sets': transformArrayOfResolvableItems([
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
	'Ankou set and robes of darkness': transformArrayOfResolvableItems([
		'Ankou mask',
		'Ankou top',
		'Ankou gloves',
		'Ankou leggings',
		'Ankou socks',
		'Hood of darkness',
		'Robe top of darkness',
		'Gloves of darkness',
		'Robe bottom of darkness',
		'Boots of darkness'
	]),
	'Master ornament kits': transformArrayOfResolvableItems([
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

	'Master misc.': transformArrayOfResolvableItems([
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
	'Master misc. 2': transformArrayOfResolvableItems([
		'Bowl wig',
		'Left eye patch',
		'Arceuus hood',
		'Hosidius hood',
		'Lovakengj hood',
		'Piscarilius hood',
		'Shayzien hood'
	]),
	'3rd Age Melee': transformArrayOfResolvableItems([
		'3rd age full helmet',
		'3rd age platebody',
		'3rd age platelegs',
		'3rd age plateskirt',
		'3rd age kiteshield'
	]),
	'3rd Age Mage': transformArrayOfResolvableItems([
		'3rd age mage hat',
		'3rd age robe top',
		'3rd age robe',
		'3rd age amulet'
	]),
	'3rd Age Range': transformArrayOfResolvableItems([
		'3rd age range coif',
		'3rd age range top',
		'3rd age range legs',
		'3rd age vambraces'
	]),
	'3rd Age Weapons and cloak': transformArrayOfResolvableItems([
		'3rd age longsword',
		'3rd age wand',
		'3rd age bow',
		'3rd age cloak'
	]),
	'3rd Age Druidic and Tools': transformArrayOfResolvableItems([
		'3rd age druidic cloak',
		'3rd age druidic robe top',
		'3rd age druidic robe bottoms',
		'3rd age druidic staff',
		'3rd age axe',
		'3rd age pickaxe'
	]),
	Gilded: transformArrayOfResolvableItems([
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
	'Gilded 2': transformArrayOfResolvableItems([
		'Gilded coif',
		"Gilded d'hide body",
		"Gilded d'hide chaps",
		"Gilded d'hide vambs",
		'Gilded 2h sword',
		'Gilded spear',
		'Gilded hasta'
	]),
	'Gilded elite/master only': transformArrayOfResolvableItems([
		'Gilded scimitar',
		'Gilded pickaxe',
		'Gilded axe',
		'Gilded spade'
	])
};
export const cluesRares = {
	'3rd Age Melee': transformArrayOfResolvableItems([
		'3rd age full helmet',
		'3rd age platebody',
		'3rd age platelegs',
		'3rd age plateskirt',
		'3rd age kiteshield'
	]),
	'3rd Age Mage': transformArrayOfResolvableItems([
		'3rd age mage hat',
		'3rd age robe top',
		'3rd age robe',
		'3rd age amulet'
	]),
	'3rd Age Range': transformArrayOfResolvableItems([
		'3rd age range coif',
		'3rd age range top',
		'3rd age range legs',
		'3rd age vambraces'
	]),
	'3rd Age Weapons and cloak': transformArrayOfResolvableItems([
		'3rd age longsword',
		'3rd age wand',
		'3rd age bow',
		'3rd age cloak'
	]),
	'3rd Age Druidic and Tools': transformArrayOfResolvableItems([
		'3rd age druidic cloak',
		'3rd age druidic robe top',
		'3rd age druidic robe bottoms',
		'3rd age druidic staff',
		'3rd age axe',
		'3rd age pickaxe'
	]),
	'3rd Age Ring': transformArrayOfResolvableItems(['Ring of 3rd age']),
	Gilded: transformArrayOfResolvableItems([
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
	'Gilded 2': transformArrayOfResolvableItems([
		'Gilded coif',
		"Gilded d'hide body",
		"Gilded d'hide chaps",
		"Gilded d'hide vambs",
		'Gilded 2h sword',
		'Gilded spear',
		'Gilded hasta'
	]),
	'Gilded elite/master only': transformArrayOfResolvableItems([
		'Gilded scimitar',
		'Gilded pickaxe',
		'Gilded axe',
		'Gilded spade'
	])
};
export const cluesAll = {
	...cluesShared,
	...cluesRares,
	...cluesBeginner,
	...cluesEasy,
	...cluesMedium,
	...cluesHard,
	...cluesElite,
	...cluesMaster
};
export const championScrolls = {
	'Champion scrolls': transformArrayOfResolvableItems([
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
	])
};
export const holiday = {
	'Birthday Event': transformArrayOfResolvableItems([
		'Cow mask',
		'Cow top',
		'Cow trousers',
		'Cow gloves',
		'Cow shoes',
		'Slice of birthday cake',
		'War ship'
	]),
	'Easter Event': transformArrayOfResolvableItems([
		'Bunny ears',
		'Easter egg'
	])
};
export const diangoCollectionLog = {
	Common: transformArrayOfResolvableItems([
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
	Uncommon: transformArrayOfResolvableItems([
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
	Rare: transformArrayOfResolvableItems([
		'Hornwood helm',
		'Hand fan',
		'Mask of balance',
		'Druidic wreath',
		'Disk of returning'
	]),
	Other: transformArrayOfResolvableItems(['Mystery box', 'Stale baguette'])
};
export const skillCapes = {
	hoods: transformArrayOfResolvableItems([
		'Mining hood',
		'Smithing hood',
		'Woodcutting hood',
		'Firemaking hood'
	]),
	capes: transformArrayOfResolvableItems([
		'Mining cape',
		'Smithing cape',
		'Woodcutting cape',
		'Firemaking cape'
	]),
	'trimmed capes': transformArrayOfResolvableItems([
		'Mining cape(t)',
		'Smithing cape(t)',
		'Woodcut. cape(t)',
		'Firemaking cape(t)'
	])
};

export const collectionLogTypes = [
	{
		name: 'Overall',
		aliases: ['all', 'overall'],
		items: removeDuplicatesFromArray(
			[...Object.values(bosses), ...Object.values(cluesAll), ...Object.values(pets)].flat(
				Infinity
			)
		)
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
		items: championScrolls
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
		name: 'Skill capes',
		aliases: ['skill capes', 'skill cape', 'skillcapes', 'skillcape'],
		items: skillCapes
	}
];
