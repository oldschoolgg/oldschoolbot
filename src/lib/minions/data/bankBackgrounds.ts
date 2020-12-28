import { PerkTier } from '../../constants';
import { resolveNameBank } from '../../util';
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
		collectionLogItemsNeeded: resolveNameBank({
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
		itemCost: resolveNameBank({
			'Armadyl godsword': 1,
			'Zamorak godsword': 1,
			'Bandos godsword': 1,
			'Saradomin godsword': 1
		}),
		gpCost: 100_000_000
	},
	{
		id: 8,
		name: 'Corporeal Beast',
		image: null,
		available: true,
		collectionLogItemsNeeded: resolveNameBank({
			'Spirit shield': 4,
			'Holy elixir': 4,
			'Spectral sigil': 1,
			'Arcane sigil': 1,
			'Elysian sigil': 1,
			'Pet dark core': 1
		}),
		itemCost: resolveNameBank({
			'Spectral spirit shield': 1,
			'Arcane spirit shield': 1
		}),
		gpCost: 100_000_000
	},
	{
		id: 9,
		name: 'Casket',
		image: null,
		available: true,
		collectionLogItemsNeeded: resolveNameBank({
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
		collectionLogItemsNeeded: resolveNameBank({
			'Little nightmare': 1,
			'Jar of dreams': 1,
			'Nightmare staff': 1,
			"Inquisitor's great helm": 1,
			"Inquisitor's hauberk": 1,
			"Inquisitor's plateskirt": 1,
			"Inquisitor's mace": 1,
			'Eldritch orb': 1,
			'Harmonised orb': 1,
			'Volatile orb': 1
		}),
		itemCost: resolveNameBank({
			'Eldritch orb': 1,
			'Harmonised orb': 1,
			'Volatile orb': 1
		}),
		gpCost: 100_000_000
	},
	{
		id: 11,
		name: 'Ariana Grande (11)',
		image: null,
		available: false
	},
	{
		id: 12,
		name: 'Transparent (12)',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 10_000_000
	},
	{
		id: 13,
		name: 'Hween',
		image: null,
		available: false
	},
	{
		id: 15,
		name: 'Homer (15)',
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
		available: false
	},
	{
		id: 18,
		name: 'Racc',
		image: null,
		available: false
	},
	{
		id: 19,
		name: 'tob',
		image: null,
		available: false
	},
	{
		id: 21,
		name: 'POST',
		image: null,
		available: false
	},
	{
		id: 22,
		name: 'Obama',
		image: null,
		available: false
	},
	{
		id: 23,
		name: "Turbos's Background (23)",
		image: null,
		available: false
	},
	{
		id: 24,
		name: 'CoX Pixel Art (24)',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 10_000_000
	},
	{
		id: 26,
		name: 'Weeb (26)',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 10_000_000
	},
	{
		id: 27,
		name: 'K-Pop (27)',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 10_000_000
	},
	{
		id: 28,
		name: 'cerb',
		image: null,
		available: false
	},
	{
		id: 29,
		name: "Subete's Background (29)",
		image: null,
		available: false
	},
	{
		id: 30,
		name: 'Troll',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 10_000_000
	},
	{
		id: 31,
		name: 'Wyrms Background (31)',
		image: null,
		available: false
	},
	{
		id: 32,
		name: 'Peepo Scooter (32)',
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
		name: 'dark',
		image: null,
		available: false
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
	}
];

export default backgroundImages;
