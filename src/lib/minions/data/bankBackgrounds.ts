import { Bank } from 'oldschooljs';

import { BitField, PerkTier } from '../../constants';
import { BankBackground } from '../types';

const backgroundImages: BankBackground[] = [
	{
		id: 1,
		name: 'Default',
		image: null,
		available: true
	},
	{
		id: 2,
		name: 'Swampman',
		image: null,
		available: false
	},
	{
		id: 3,
		name: 'Lumbridge',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 10_000_000
	},
	{
		id: 4,
		name: 'Karamja',
		image: null,
		available: false
	},
	{
		id: 5,
		name: 'Edgeville',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 10_000_000
	},
	{
		id: 6,
		name: 'Barrows',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Six,
		gpCost: 10_000_000
	},
	{
		id: 7,
		name: 'Bandos',
		image: null,
		available: true,
		collectionLogItemsNeeded: new Bank({
			'Armadyl hilt': 1,
			'Zamorak hilt': 1,
			'Bandos hilt': 1,
			'Saradomin hilt': 1,
			'Armadyl helmet': 1,
			'Armadyl chestplate': 1,
			'Armadyl chainskirt': 1,
			'Saradomin sword': 1,
			"Saradomin's light": 1,
			'Armadyl crossbow': 1,
			'Bandos chestplate': 1,
			'Bandos tassets': 1,
			'Bandos boots': 1,
			'Steam battlestaff': 1,
			'Zamorakian spear': 1,
			'Staff of the dead': 1,
			'Pet general graardor': 1,
			"Pet k'ril tsutsaroth": 1,
			"Pet kree'arra": 1,
			'Pet zilyana': 1
		}),
		itemCost: new Bank({
			'Armadyl godsword': 1,
			'Zamorak godsword': 1,
			'Bandos godsword': 1,
			'Saradomin godsword': 1,
			'Ancient godsword': 1
		}),
		gpCost: 100_000_000
	},
	{
		id: 8,
		name: 'Corporeal Beast',
		image: null,
		available: true,
		collectionLogItemsNeeded: new Bank({
			'Spirit shield': 4,
			'Holy elixir': 4,
			'Spectral sigil': 1,
			'Arcane sigil': 1,
			'Elysian sigil': 1,
			'Pet dark core': 1,
			'Jar of spirits': 1
		}),
		itemCost: new Bank({
			'Spectral spirit shield': 1,
			'Arcane spirit shield': 1,
			'Elysian spirit shield': 1
		}),
		gpCost: 100_000_000
	},
	{
		id: 9,
		name: 'Casket',
		image: null,
		available: true,
		collectionLogItemsNeeded: new Bank({
			'Large spade': 1,
			'Clueless scroll': 1,
			'Heavy casket': 1,
			'Scroll sack': 1
		}),
		gpCost: 100_000_000
	},
	{
		id: 10,
		name: 'Nightmare',
		image: null,
		available: true,
		collectionLogItemsNeeded: new Bank({
			'Little nightmare': 1,
			'Jar of dreams': 1,
			'Nightmare staff': 1,
			"Inquisitor's great helm": 1,
			"Inquisitor's hauberk": 1,
			"Inquisitor's plateskirt": 1,
			"Inquisitor's mace": 1,
			'Eldritch orb': 1,
			'Harmonised orb': 1,
			'Volatile orb': 1,
			'Slepey tablet': 1,
			'Parasitic egg': 1
		}),
		itemCost: new Bank({
			'Eldritch orb': 1,
			'Harmonised orb': 1,
			'Volatile orb': 1
		}),
		gpCost: 100_000_000
	},
	{
		id: 11,
		name: 'Ariana Grande',
		image: null,
		available: false
	},
	{
		id: 12,
		name: 'Transparent',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 10_000_000,
		transparent: true
	},
	{
		id: 13,
		name: 'Hween',
		image: null,
		available: false
	},
	{
		id: 14,
		name: 'CoX',
		image: null,
		hasPurple: true,
		purpleImage: null,
		available: true,
		bitfield: BitField.HasPermanentEventBackgrounds
	},
	{
		id: 15,
		name: 'Homer',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 10_000_000
	},
	{
		id: 16,
		name: 'Jad',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 10_000_000
	},
	{
		id: 17,
		name: 'Bop',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 2_147_483_647,
		sacValueRequired: 2_147_483_647
	},
	{
		id: 18,
		name: 'Racc',
		image: null,
		available: false
	},
	{
		id: 19,
		name: 'Rick CustomBG',
		image: null,
		available: false,
		owners: ['604278562320810009']
	},
	{
		id: 22,
		name: 'Nieve',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 20_000_000
	},
	{
		id: 23,
		name: 'ToB',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 20_000_000,
		transparent: true,
		hasPurple: true,
		purpleImage: null
	},
	{
		id: 24,
		name: 'Zilyana',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Three,
		gpCost: 20_000_000
	},
	{
		id: 25,
		name: 'Zilyana Transparent',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Three,
		gpCost: 20_000_000,
		transparent: true
	},
	{
		id: 26,
		name: 'Konar Transparent',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 20_000_000,
		transparent: true
	},
	{
		id: 27,
		name: 'Konar',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 20_000_000
	},
	{
		id: 28,
		name: 'Sandwich Lady',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 20_000_000,
		transparent: true
	},
	{
		id: 29,
		name: 'Farmer Jane (Dynamic)',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 500_000,
		alternateImages: [{ id: 1 }]
	},
	{
		id: 30,
		name: 'Farmer Jane (Transparent, Dynamic)',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 500_000,
		transparent: true,
		alternateImages: [{ id: 1 }]
	},
	{
		id: 31,
		name: 'Swans (Transparent)',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 500_000,
		transparent: true
	},
	{
		id: 32,
		name: 'Peepo Scooter',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 10_000_000
	},
	{
		id: 33,
		name: 'Halloween Bot Avatar',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 10_000_000
	},
	{
		id: 34,
		name: 'Dark',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 10_000_000
	},
	{
		id: 35,
		name: 'whale',
		image: null,
		available: false
	},
	{
		id: 36,
		name: 'Morytania',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Five,
		gpCost: 10_000_000
	},
	{
		id: 37,
		name: 'Grass',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 10_000_000
	},
	{
		id: 38,
		name: 'baannanna CustomBG',
		image: null,
		available: false,
		owners: ['209825195131797504'],
		transparent: true
	},
	{
		id: 39,
		name: 'Zuk',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 10_000_000
	},
	{
		id: 40,
		name: 'Turbo CustomBG',
		image: null,
		available: false,
		owners: ['288054683161853952'],
		purpleImage: null,
		hasPurple: true
	},
	{
		id: 41,
		name: 'theshadyhobo CustomBG',
		image: null,
		available: false,
		owners: ['343104695209951255']
	},
	{
		id: 42,
		name: 'iYeeYee CustomBG',
		image: null,
		available: false,
		owners: ['545103898558595092']
	},
	{
		id: 47,
		name: 'Slav CustomBG',
		image: null,
		available: false,
		owners: ['164490892533563393']
	},
	{
		id: 48,
		name: 'Beans CustomBG',
		image: null,
		available: false,
		owners: ['134922117081858050']
	},
	{
		id: 52,
		name: 'Cyrillax CustomBG',
		image: null,
		hasPurple: true,
		purpleImage: null,
		available: false,
		owners: ['425134194436341760']
	},
	{
		id: 67,
		name: 'Wilderness',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		collectionLogItemsNeeded: new Bank({
			'Dragon pickaxe': 1,
			'Dragon med helm': 1,
			'Kbd heads': 1,
			'Draconic visage': 1,
			'Prince black dragon': 1,
			'Dragon 2h sword': 1,
			'Pet chaos elemental': 1,
			'Malediction shard 1': 1,
			'Odium shard 1': 1,
			'Malediction shard 2': 1,
			'Odium shard 2': 1,
			Fedora: 1,
			'Malediction shard 3': 1,
			'Odium shard 3': 1,
			"Scorpia's offspring": 1,
			'Treasonous ring': 1,
			'Venenatis spiderling': 1,
			'Tyrannical ring': 1,
			'Callisto cub': 1,
			'Ring of the gods': 1,
			"Vet'ion jr.": 1
		}),
		itemCost: new Bank({
			'Dragon pickaxe': 1,
			'Dragon med helm': 1,
			'Draconic visage': 1,
			'Dragon 2h sword': 1,
			'Odium ward ': 1,
			'Malediction ward': 1,
			'Treasonous ring': 1,
			'Tyrannical ring': 1,
			'Ring of the gods': 1
		}),
		gpCost: 100_000_000
	},
	{
		id: 68,
		name: 'Grand Exchange',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 2_147_483_647,
		sacValueRequired: 2_147_483_647
	},
	{
		id: 69,
		name: 'Falador Park',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		collectionLogItemsNeeded: new Bank({
			Tangleroot: 1
		}),
		gpCost: 100_000_000,
		skillsNeeded: {
			farming: 99
		}
	},
	{
		id: 75,
		name: 'Sunny CustomBG',
		image: null,
		available: false,
		owners: ['501893557960048650']
	},
	{
		id: 76,
		name: 'Pets',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 20_000_000,
		transparent: true
	},
	{
		id: 77,
		name: 'Volt CustomBG',
		image: null,
		available: false,
		owners: ['793267134821957673']
	},
	{
		id: 80,
		name: 'Spartin CustomBG',
		image: null,
		available: false,
		owners: ['322626810779271169']
	},
	{
		id: 81,
		name: 'Eggscape CustomBG',
		image: null,
		available: false,
		owners: ['268767449791332354']
	},
	{
		id: 82,
		name: 'Guacamole CustomBG',
		image: null,
		available: false,
		owners: ['367701420549341215']
	},
	{
		id: 83,
		name: 'Zbe CustomBG',
		image: null,
		available: false,
		owners: ['252309543634075659']
	},
	{
		id: 84,
		name: 'Hayz CustomBG',
		image: null,
		available: false,
		owners: ['416304907243749382'],
		transparent: true
	},
	{
		id: 85,
		name: 'Mylife CustomBG',
		image: null,
		available: false,
		owners: ['251536370613485568']
	},
	{
		id: 86,
		name: 'Anime CustomBG',
		image: null,
		available: false,
		owners: ['363917147052834819']
	},
	{
		id: 87,
		name: 'Hekla CustomBG',
		image: null,
		available: false,
		owners: ['255767128051810305']
	},
	{
		id: 88,
		name: 'Benny CustomBG',
		image: null,
		available: false,
		owners: ['507686806624534529']
	},
	{
		id: 89,
		name: 'Abyssalcrow8 CustomBG',
		image: null,
		available: false,
		owners: ['268901875158351872']
	},
	{
		id: 90,
		name: 'Ignecarus',
		image: null,
		available: true,
		collectionLogItemsNeeded: new Bank({
			'Dragon egg': 1,
			'Ignis ring': 1,
			'Ignecarus dragonclaw': 1,
			'Ignecarus scales': 1
		}),
		itemCost: new Bank({
			'Ignecarus scales': 1,
			'Ignecarus dragonclaw': 1
		}),
		gpCost: 500_000_000,
		perkTierNeeded: PerkTier.Four
	},
	{
		id: 91,
		name: 'Tetreths CustomBG',
		image: null,
		available: false,
		owners: ['577647179909431311']
	},
	{
		id: 92,
		name: 'Smokey',
		image: null,
		available: true,
		gpCost: 100_000_000,
		perkTierNeeded: PerkTier.Four,
		transparent: true
	},
	{
		id: 93,
		name: 'Purrincess CustomBG',
		image: null,
		available: false,
		owners: ['538600275221413900']
	},
	{
		id: 94,
		name: 'Rezero CustomBG',
		image: null,
		available: false,
		owners: ['192621282452439041']
	},
	{
		id: 95,
		name: 'OilInGasLife CustomBG',
		image: null,
		available: false,
		owners: ['944238795329511465']
	},
	{
		id: 96,
		name: 'Remy',
		image: null,
		available: true,
		gpCost: 10_000_000,
		perkTierNeeded: PerkTier.Four,
		transparent: true
	},
	{
		id: 97,
		name: 'Skipper',
		image: null,
		available: true,
		gpCost: 10_000_000,
		perkTierNeeded: PerkTier.Four,
		transparent: true
	},
	{
		id: 98,
		name: 'Jersey CustomBG',
		image: null,
		available: false,
		owners: ['252113050704805890']
	},
	{
		id: 100,
		name: 'Christmas Tree',
		image: null,
		available: false
	},
	{
		id: 101,
		name: 'TastyPum CustomBG',
		image: null,
		available: false,
		owners: ['794368001856110594']
	},
	{
		id: 102,
		name: 'Serg CustomBG',
		image: null,
		available: false,
		owners: ['797618464176996372']
	},
	{
		id: 103,
		name: 'Epic CustomBG',
		image: null,
		available: false,
		owners: ['874714227984719922']
	},
	{
		id: 105,
		name: 'Troll',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 10_000_000
	},
	{
		id: 500,
		name: 'Kabe CustomBG',
		image: null,
		available: false,
		owners: ['354873929522741248'],
		purpleImage: null,
		hasPurple: true
	},
	{
		id: 501,
		name: 'Timebrawler CustomBG',
		image: null,
		available: false,
		owners: ['235883747658956802'],
		purpleImage: null,
		hasPurple: true
	},
	{
		id: 502,
		name: 'Kiddo CustomBG',
		image: null,
		available: false,
		owners: ['775241966677131306']
	},
	{
		id: 503,
		name: 'Halloween Manor',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 10_000_000
	}
];

export default backgroundImages;
