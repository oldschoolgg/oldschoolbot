import { transformStringBankToNum } from '../../util/transformStringBankToNum';
import { BankBackground } from '../types';
import { PerkTier } from '../../constants';

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
		available: false
	},
	{
		id: 7,
		name: 'Bandos',
		image: null,
		available: true,
		collectionLogItemsNeeded: transformStringBankToNum({
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
			'Pet general graardor': 1
		}),
		itemCost: transformStringBankToNum({
			'Armadyl hilt': 1,
			'Zamorak hilt': 1,
			'Bandos hilt': 1,
			'Saradomin hilt': 1
		}),
		gpCost: 100_000_000
	},
	{
		id: 8,
		name: 'Corporeal Beast',
		image: null,
		available: true,
		collectionLogItemsNeeded: transformStringBankToNum({
			'Spirit shield': 4,
			'Holy elixir': 4,
			'Spectral sigil': 1,
			'Arcane sigil': 1,
			'Elysian sigil': 1,
			'Pet dark core': 1
		}),
		gpCost: 100_000_000
	}
];

export default backgroundImages;
