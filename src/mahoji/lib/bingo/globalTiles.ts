import type { Bank } from 'oldschooljs';

import { resolveItems } from 'oldschooljs/dist/util/util';
import { championScrolls, skillingPetsCL } from '../../../lib/data/CollectionsExport';
import type { GlobalBingoTile } from './bingoUtil';

const otherSpiritShieldParts = resolveItems(['Blessed spirit shield', 'Holy elixir', 'Spirit shield']);
const allSpiritShieldSets = [
	resolveItems(['Elysian spirit shield', 'Elysian sigil', ...otherSpiritShieldParts]),
	resolveItems(['Arcane spirit shield', 'Arcane sigil', ...otherSpiritShieldParts]),
	resolveItems(['Spectral spirit shield', 'Spectral sigil', ...otherSpiritShieldParts])
];

const allRingSets = [
	resolveItems(['Ultor ring', 'Ultor icon', 'Chromium ingot', 'Ultor vestige', 'Berserker icon', 'Berserker ring']),
	resolveItems(['Magus ring', 'Magus icon', 'Chromium ingot', 'Magus vestige', 'Seers icon', 'Seers ring']),
	resolveItems(['Venator ring', 'Venator icon', 'Chromium ingot', 'Venator vestige', 'Archer icon', 'Archers ring']),
	resolveItems([
		'Bellator ring',
		'Bellator icon',
		'Chromium ingot',
		'Bellator vestige',
		'Warrior icon',
		'Warrior ring'
	])
];

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
		id: 3,
		name: 'Receive any Torva Armour Piece from Nex',
		oneOf: resolveItems(['Torva full helm (damaged)', 'Torva platebody (damaged)', 'Torva platelegs (damaged)'])
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
		name: 'Create any spirit shield from scratch',
		customReq: (cl: Bank) => {
			return allSpiritShieldSets.some(set => set.every(item => cl.has(item)));
		},
		allItems: allSpiritShieldSets.flat(2)
	},
	{
		id: 38,
		name: 'Create a Ultor, Magus, Venator or Bellator ring from scratch',
		customReq: (cl: Bank) => {
			return allRingSets.some(set => set.every(item => cl.has(item))) && cl.amount('Chromium ingot') >= 3;
		},
		allItems: allRingSets.flat(2)
	}
];
