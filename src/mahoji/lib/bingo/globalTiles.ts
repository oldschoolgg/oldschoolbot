import { uniqueArr } from 'e';
import { Bank } from 'oldschooljs';

import { championScrolls, skillingPetsCL } from '../../../lib/data/CollectionsExport';
import { TanglerootTable } from '../../../lib/minions/data/killableMonsters/custom/Treebeard';
import { assert } from '../../../lib/util';
import resolveItems from '../../../lib/util/resolveItems';
import { GlobalBingoTile } from './bingoUtil';

export const globalBingoTiles: GlobalBingoTile[] = [
	{
		id: 1,
		name: 'Receive any boss pet',
		oneOf: resolveItems([
			'Ikkle hydra',
			'Callisto cub',
			'Hellpuppy',
			'Pet chaos elemental',
			'Pet zilyana',
			'Pet dark core',
			'Pet dagannoth prime',
			'Pet dagannoth supreme',
			'Pet dagannoth rex',
			'Pet general graardor',
			'Baby mole',
			'Noon',
			'Kalphite princess',
			'Prince black dragon',
			'Pet kraken',
			"Pet kree'arra",
			"Pet k'ril tsutsaroth",
			"Scorpia's offspring",
			'Pet smoke devil',
			'Venenatis spiderling',
			"Vet'ion jr.",
			'Vorki',
			'Pet snakeling',
			'Olmlet',
			"Lil' zik",
			'Sraracha',
			'Nexling',
			'Little nightmare'
		])
	},
	{
		id: 2,
		name: 'Receive any skilling pet',
		oneOf: skillingPetsCL
	},
	{
		id: 4,
		name: 'Receive a Dragon warhammer',
		allOf: resolveItems(['Dragon warhammer'])
	},
	{
		id: 5,
		name: 'Receive a Ring of endurance (uncharged)',
		allOf: resolveItems(['Ring of endurance (uncharged)'])
	},
	{
		id: 6,
		name: 'Receive any Sigil from Corp',
		oneOf: resolveItems(['Arcane sigil', 'Elysian sigil', 'Spectral sigil'])
	},
	// Row 2
	{
		id: 7,
		name: 'Receive all 3 Wilderness Rings',
		allOf: resolveItems(['Tyrannical ring', 'Treasonous ring', 'Ring of the gods'])
	},
	{
		id: 8,
		name: 'Receive a Tanzanite fang or Magic fang from Zulrah',
		oneOf: resolveItems(['Tanzanite fang', 'Magic fang'])
	},
	{
		id: 9,
		name: 'Receive any unique seed from Gauntlet',
		oneOf: resolveItems(['Crystal weapon seed', 'Crystal armour seed', 'Enhanced crystal weapon seed'])
	},
	{
		id: 10,
		name: 'Create an Odium ward or Malediction ward from scratch',
		customReq: cl => {
			return (
				['Odium shard 1', 'Odium shard 2', 'Odium shard 3', 'Odium ward'].every(item => cl.has(item)) ||
				['Malediction shard 1', 'Malediction shard 2', 'Malediction shard 3', 'Malediction ward'].every(item =>
					cl.has(item)
				)
			);
		},
		allItems: resolveItems([
			'Odium shard 1',
			'Odium shard 2',
			'Odium shard 3',
			'Odium ward',
			'Malediction shard 1',
			'Malediction shard 2',
			'Malediction shard 3',
			'Malediction ward'
		])
	},
	{
		id: 11,
		name: 'Receive all 3 Cerberus crystals',
		allOf: resolveItems(['Primordial crystal', 'Pegasian crystal', 'Eternal crystal'])
	},
	{
		id: 13,
		name: 'Receive/hunt 5000 Red chinchompas',
		customReq(cl) {
			return cl.amount('Red chinchompa') >= 5000;
		},
		allItems: resolveItems(['Red chinchompa'])
	},
	{
		id: 14,
		name: 'Obtain one of: Phoenix, Tiny tempor, Youngllef, Smolcano',
		oneOf: resolveItems(['Phoenix', 'Tiny tempor', 'Youngllef', 'Smolcano'])
	},
	{
		id: 15,
		name: 'Receive 2 unique godsword hilts',
		customReq(cl) {
			return (
				resolveItems(['Ancient hilt', 'Armadyl hilt', 'Bandos hilt', 'Saradomin hilt', 'Zamorak hilt']).filter(
					i => cl.has(i)
				).length >= 2
			);
		},
		allItems: resolveItems(['Ancient hilt', 'Armadyl hilt', 'Bandos hilt', 'Saradomin hilt', 'Zamorak hilt'])
	},
	{
		id: 16,
		name: 'Receive a black tourmaline core',
		allOf: resolveItems(['Black tourmaline core'])
	},
	{
		id: 17,
		name: 'Receive a Tome of water or Tome of fire',
		oneOf: resolveItems(['Tome of fire', 'Tome of water (empty)'])
	},
	{
		id: 18,
		name: 'Receive any Champion scroll',
		oneOf: resolveItems(championScrolls)
	},
	{
		id: 19,
		name: 'Receive/chop 5000 mahogany logs',
		customReq(cl) {
			return cl.amount('Mahogany logs') >= 5000;
		},
		allItems: resolveItems(['Mahogany logs'])
	},
	{
		id: 20,
		name: 'Receive a Draconic visage',
		allOf: resolveItems(['Draconic visage'])
	},
	{
		id: 21,
		name: 'Receive a Dragon pickaxe',
		allOf: resolveItems(['Dragon pickaxe'])
	},
	{
		id: 22,
		name: 'Receive a Basilisk jaw',
		allOf: resolveItems(['Basilisk jaw'])
	},
	{
		id: 23,
		name: 'Receive a Staff of the dead',
		allOf: resolveItems(['Staff of the dead'])
	},
	{
		id: 24,
		name: 'Receive any orb or armour piece from the Nightmare',
		oneOf: resolveItems([
			"Inquisitor's great helm",
			"Inquisitor's hauberk",
			"Inquisitor's plateskirt",
			'Volatile orb',
			'Harmonised orb',
			'Eldritch orb'
		])
	},
	// Row 4
	{
		id: 25,
		name: 'Receive any Boss jar',
		oneOf: resolveItems([
			'Jar of chemicals',
			'Jar of darkness',
			'Jar of decay',
			'Jar of dirt',
			'Jar of dreams',
			'Jar of eyes',
			'Jar of sand',
			'Jar of smoke',
			'Jar of souls',
			'Jar of spirits',
			'Jar of stone',
			'Jar of swamp'
		])
	},
	{
		id: 26,
		name: 'Receive a hydra eye, fang and heart.',
		allOf: resolveItems(["Hydra's eye", "Hydra's fang", "Hydra's heart"])
	},
	{
		id: 27,
		name: 'Receive a curved bone',
		allOf: resolveItems(['Curved bone'])
	},
	{
		id: 28,
		name: 'Receive a Black mask (10)',
		allOf: resolveItems(['Black mask (10)'])
	},
	{
		id: 29,
		name: 'Receive Bandos tassets or Bandos chestplate',
		oneOf: resolveItems(['Bandos tassets', 'Bandos chestplate'])
	},
	{
		id: 30,
		name: "Receive any armour drop from Kree'arra",
		oneOf: resolveItems(['Armadyl helmet', 'Armadyl chestplate', 'Armadyl chainskirt'])
	},
	// Row 6
	{
		id: 31,
		name: 'Receive an Armadyl crossbow',
		allOf: resolveItems(['Armadyl crossbow'])
	},
	{
		id: 32,
		name: 'Receive a Kq head',
		allOf: resolveItems(['Kq head'])
	},
	{
		id: 33,
		name: 'Receive a Strange old lockpick',
		allOf: resolveItems(['Strange old lockpick'])
	},
	{
		id: 34,
		name: 'Receive a Golden tench',
		allOf: resolveItems(['Golden tench'])
	},
	{
		id: 35,
		name: 'Receive a Sarachnis cudgel',
		allOf: resolveItems(['Sarachnis cudgel'])
	},
	{
		id: 36,
		name: 'Receive a fedora',
		allOf: resolveItems(['Fedora'])
	},
	{
		id: 37,
		name: 'Receive any custom pet',
		oneOf: resolveItems([
			'Doug',
			'Zippy',
			'Shelldon',
			'Remy',
			'Lil Lamb',
			'Harry',
			'Klik',
			'Wintertoad',
			'Scruffy',
			'Zak',
			'Skipper',
			'Ori',
			'Takon',
			'Obis',
			'Peky',
			'Plopper',
			'Brock',
			'Wilvus',
			'Sandy',
			'Baby kalphite king',
			'Steve',
			'Voidling',
			'Jal-MejJak',
			'Queen black dragonling',
			'Phoenix eggling',
			'Cogsworth',
			'Mini moktang',
			'Balloon cat',
			'Baby yaga house',
			'Gary',
			'Crush',
			'Herbert'
		])
	},
	{
		id: 38,
		name: 'Receive any Main+off-hand drygore set',
		customReq: cl => {
			return [
				['Drygore longsword', 'Offhand drygore longsword'],
				['Drygore mace', 'Offhand drygore mace'],
				['Drygore rapier', 'Offhand drygore rapier']
			].some(set => set.every(item => cl.has(item)));
		},
		allItems: resolveItems([
			'Drygore longsword',
			'Offhand drygore longsword',
			'Drygore mace',
			'Offhand drygore mace',
			'Drygore rapier',
			'Offhand drygore rapier'
		])
	},
	{
		id: 39,
		name: 'Receive a Moktang pet, or dye or frame',
		oneOf: resolveItems(['Mini moktang', 'Volcanic dye', 'Igne gear frame'])
	},
	{
		id: 40,
		name: 'Receive a Vasa Magus pet, or jar, or scroll, or robes',
		oneOf: resolveItems(['Jar of magic', 'Tattered robes of Vasa', 'Voidling', 'Magus scroll'])
	},
	{
		id: 41,
		name: 'Create any spirit shield from scratch',
		customReq: cl => {
			return [
				['Holy elixir', 'Spirit shield', 'Spectral sigil', 'Spectral spirit shield'],
				['Holy elixir', 'Spirit shield', 'Arcane sigil', 'Arcane spirit shield'],
				['Holy elixir', 'Spirit shield', 'Elysian sigil', 'Elysian spirit shield'],
				['Holy elixir', 'Spirit shield', 'Divine sigil', 'Divine spirit shield']
			].some(set => set.every(item => cl.has(item)));
		},
		allItems: resolveItems([
			'Holy elixir',
			'Spirit shield',
			'Spectral sigil',
			'Spectral spirit shield',
			'Holy elixir',
			'Spirit shield',
			'Arcane sigil',
			'Arcane spirit shield',
			'Holy elixir',
			'Spirit shield',
			'Elysian sigil',
			'Elysian spirit shield',
			'Holy elixir',
			'Spirit shield',
			'Divine sigil',
			'Divine spirit shield'
		])
	},
	{
		id: 42,
		name: 'Receive any weapon from revs',
		oneOf: resolveItems([
			'Amulet of avarice',
			"Craw's bow (u)",
			"Thammaron's sceptre (u)",
			"Viggora's chainmace (u)"
		])
	},
	{
		id: 43,
		name: 'Receive any TOB unique',
		oneOf: resolveItems([
			'Scythe of vitur (uncharged)',
			'Ghrazi rapier',
			'Sanguinesti staff (uncharged)',
			'Justiciar faceguard',
			'Justiciar chestguard',
			'Justiciar legguards',
			'Avernic defender hilt'
		])
	},
	{
		id: 44,
		name: 'Receive any COX unique (excluding scrolls)',
		oneOf: resolveItems([
			'Takon',
			'Steve',
			'Olmlet',
			'Twisted bow',
			'Elder maul',
			'Kodai insignia',
			'Dragon claws',
			'Ancestral hat',
			'Ancestral robe top',
			'Ancestral robe bottom',
			"Dinh's bulwark",
			'Dragon hunter crossbow',
			'Twisted buckler'
		])
	},
	{
		id: 45,
		name: 'Receive any Ignecarus unique',
		oneOf: resolveItems(['Ignis ring', 'Ignecarus dragonclaw', 'Dragon egg'])
	},
	{
		id: 46,
		name: 'Receive any Malygos unique',
		oneOf: resolveItems(['Abyssal cape', 'Abyssal thread', 'Ori'])
	},
	{
		id: 47,
		name: 'Receive 120 Athelas seeds',
		customReq: cl => cl.has(new Bank().add('Athelas seed', 120)),
		allItems: resolveItems(['Athelas seed'])
	},
	{
		id: 48,
		name: 'Receive all Polypore dungeon uniques',
		allOf: resolveItems([
			'Mycelium visor web',
			'Morchella mushroom spore',
			'Mycelium leggings web',
			'Ganodermic gloves',
			'Ganodermic boots',
			'Tombshroom spore',
			'Mycelium poncho web',
			'Grifolic gloves',
			'Grifolic orb'
		])
	},
	{
		id: 49,
		name: 'Receive all GWD uniques (excluding pets)',
		allOf: resolveItems([
			'Godsword shard 1',
			'Godsword shard 2',
			'Godsword shard 3',

			'Armadyl crossbow',
			'Saradomin hilt',
			'Saradomin sword',
			"Saradomin's light",

			'Bandos chestplate',
			'Bandos tassets',
			'Bandos boots',
			'Bandos hilt',

			'Armadyl helmet',
			'Armadyl chestplate',
			'Armadyl chainskirt',
			'Armadyl hilt',

			'Staff of the dead',
			'Zamorakian spear',
			'Steam battlestaff',
			'Zamorak hilt'
		])
	},
	{
		id: 50,
		name: 'Receive any Naxxus unique',
		oneOf: resolveItems(['Dark crystal', 'Abyssal gem', 'Tattered tome', 'Spellbound ring'])
	},
	{
		id: 51,
		name: 'Receive all 3 Dagannoth Kings pets',
		allOf: resolveItems(['Pet dagannoth prime', 'Pet dagannoth supreme', 'Pet dagannoth rex'])
	},
	{
		id: 52,
		name: 'Receive a full set of Nex armour',
		customReq: cl => {
			return [
				[
					'Torva full helm (broken)',
					'Torva platebody (broken)',
					'Torva platelegs (broken)',
					'Torva boots (broken)',
					'Torva gloves (broken)'
				],
				[
					'Pernix cowl (broken)',
					'Pernix body (broken)',
					'Pernix chaps (broken)',
					'Pernix boots (broken)',
					'Pernix gloves (broken)'
				],
				[
					'Virtus mask (broken)',
					'Virtus robe top (broken)',
					'Virtus robe legs (broken)',
					'Virtus boots (broken)',
					'Virtus gloves (broken)'
				]
			].some(set => set.every(item => cl.has(item)));
		},
		allItems: resolveItems([
			'Torva full helm (broken)',
			'Pernix cowl (broken)',
			'Virtus mask (broken)',
			'Torva platebody (broken)',
			'Pernix body (broken)',
			'Virtus robe top (broken)',
			'Torva platelegs (broken)',
			'Pernix chaps (broken)',
			'Virtus robe legs (broken)',
			'Torva boots (broken)',
			'Pernix boots (broken)',
			'Virtus boots (broken)',
			'Torva gloves (broken)',
			'Pernix gloves (broken)',
			'Virtus gloves (broken)'
		])
	},
	{
		id: 53,
		name: 'Receive any Nihiliz unique',
		oneOf: resolveItems(['Nihil horn', 'Zaryte vambraces', 'Nexling'])
	},
	{
		id: 54,
		name: 'Receive all Tangleroot variants from Treebeard',
		oneOf: TanglerootTable.allItems
	},
	{
		id: 55,
		name: 'Receive 4 Gorajan shards',
		customReq: cl => cl.has(new Bank().add('Gorajan shards', 4)),
		allItems: resolveItems(['Gorajan shards'])
	},
	{
		id: 56,
		name: 'Receive a unique from Baxtorian Bathhouses',
		oneOf: resolveItems(['Phoenix eggling', 'Inferno adze', 'Flame gloves', 'Ring of fire'])
	},
	{
		id: 57,
		name: 'Receive a statue, egg or banana from Monkey Rumble',
		oneOf: resolveItems(['Marimbo statue', 'Monkey egg', 'Big banana'])
	},
	{
		id: 58,
		name: 'Receive 50x Korulsi seeds',
		customReq: cl => cl.has(new Bank().add('Korulsi seed', 50)),
		allItems: resolveItems(['Korulsi seed'])
	},
	{
		id: 5000,
		name: 'Create Master Farmer Outfit from Scratch (8 Ent hides + 5 outfit pieces)',
		customReq: cl => {
			return (
				cl.has(new Bank().add('Ent hide', 8)) &&
				[
					'Master farmer hat',
					'Master farmer jacket',
					'Master farmer pants',
					'Master farmer gloves',
					'Master farmer boots'
				].every(masterFarmerPiece => cl.has(masterFarmerPiece))
			);
		},
		allItems: resolveItems([
			'Ent hide',
			'Master farmer hat',
			'Master farmer jacket',
			'Master farmer pants',
			'Master farmer gloves',
			'Master farmer boots'
		])
	},
	{
		id: 5001,
		name: 'Receive 5x Squid dye',
		customReq: cl => cl.has(new Bank().add('Squid dye', 5)),
		allItems: resolveItems(['Squid dye'])
	}
];

assert(uniqueArr(globalBingoTiles.map(i => i.id)).length === globalBingoTiles.length);
