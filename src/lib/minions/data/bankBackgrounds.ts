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
		name: 'Morytania',
		image: null,
		available: false
	},
	{
		id: 3,
		name: 'Lumbridge',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Four,
		gpCost: 100_000_000
	},
	{
		id: 4,
		name: 'Karamja',
		image: null,
		available: false
	},
	{
		id: 5,
		name: 'Draynor Manor',
		image: null,
		available: false
	},
	{
		id: 6,
		name: 'Barrows',
		image: null,
		available: true,
		perkTierNeeded: PerkTier.Six,
		gpCost: 100_000_000
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
		gpCost: 100_000_000
	},
	{
		id: 11,
		name: 'Relax',
		image: null,
		available: false
	},
	{
		id: 12,
		name: 'Cat',
		image: null,
		available: false
	},
	{
		id: 13,
		name: 'Hween',
		image: null,
		available: false
	},
	{
		id: 15,
		name: 'Homer',
		image: null,
		available: false
	},
	{
		id: 16,
		name: 'Jad',
		image: null,
		available: false
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
		id: 20,
		name: 'Relax',
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
		name: 'RS3',
		image: null,
		available: false
	},
	{
		id: 24,
		name: 'ps4',
		image: null,
		available: false
	},
	{
		id: 25,
		name: 'mac',
		image: null,
		available: false
	},
	{
		id: 26,
		name: 'weeb',
		image: null,
		available: false
	},
	{
		id: 27,
		name: 'kpop',
		image: null,
		available: false
	},
	{
		id: 28,
		name: 'cerb',
		image: null,
		available: false
	},
	{
		id: 29,
		name: 'Cab',
		image: null,
		available: false
	},
	{
		id: 30,
		name: 'troll',
		image: null,
		available: false
	},
	{
		id: 31,
		name: 'bender',
		image: null,
		available: false
	},
	{
		id: 32,
		name: 'peeposcooter',
		image: null,
		available: false
	},
	{
		id: 33,
		name: 'high',
		image: null,
		available: false
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
	}
];

export default backgroundImages;
