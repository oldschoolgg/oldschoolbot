import { Createable } from '.';
import itemID from '../util/itemID';
import { transformStringBankToNum } from '../util/transformStringBankToNum';

const Misc: Createable[] = [
	{
		name: 'Malediction ward',
		inputItems: {
			[itemID('Malediction shard 1')]: 1,
			[itemID('Malediction shard 2')]: 1,
			[itemID('Malediction shard 3')]: 1
		},
		outputItems: {
			[itemID('Malediction ward')]: 1
		},
		smithingLevel: 1
	},
	{
		name: 'Odium ward',
		inputItems: {
			[itemID('Odium shard 1')]: 1,
			[itemID('Odium shard 2')]: 1,
			[itemID('Odium shard 3')]: 1
		},
		outputItems: {
			[itemID('Odium ward')]: 1
		},
		smithingLevel: 1
	},
	{
		name: 'Crystal key',
		inputItems: {
			[itemID('Loop half of key')]: 1,
			[itemID('Tooth half of key')]: 1
		},
		outputItems: {
			[itemID('Crystal key')]: 1
		},
		smithingLevel: 1
	},
	{
		name: 'Master clue',
		inputItems: {
			[itemID('Clue scroll (easy)')]: 1,
			[itemID('Clue scroll (medium)')]: 1,
			[itemID('Clue scroll (hard)')]: 1,
			[itemID('Clue scroll (elite)')]: 1
		},
		outputItems: {
			[itemID('Clue scroll (master)')]: 1
		},
		cantHaveItems: {
			[itemID('Clue scroll (master)')]: 1
		}
	},
	{
		name: 'Infernal axe',
		inputItems: {
			[itemID('Dragon axe')]: 1,
			[itemID('Smouldering stone')]: 1
		},
		outputItems: {
			[itemID('Infernal axe')]: 1
		},
		firemakingLevel: 85
	},
	{
		name: 'Hell cat ears',
		inputItems: {
			[itemID('Cat ears')]: 1,
			[itemID('Red dye')]: 1
		},
		outputItems: {
			[itemID('Hell cat ears')]: 1
		},
		cantHaveItems: {
			[itemID('Hell cat ears')]: 1
		}
	},
	{
		name: 'Holy book',
		inputItems: transformStringBankToNum({
			'Saradomin page 1': 1,
			'Saradomin page 2': 1,
			'Saradomin page 3': 1,
			'Saradomin page 4': 1
		}),
		outputItems: transformStringBankToNum({
			'Holy book': 1
		}),
		agilityLevel: 35,
		QPRequired: 5
	},
	{
		name: 'Book of balance',
		inputItems: transformStringBankToNum({
			'Guthix page 1': 1,
			'Guthix page 2': 1,
			'Guthix page 3': 1,
			'Guthix page 4': 1
		}),
		outputItems: transformStringBankToNum({
			'Book of balance': 1
		}),
		agilityLevel: 35,
		QPRequired: 5
	},
	{
		name: 'Unholy book',
		inputItems: transformStringBankToNum({
			'Zamorak page 1': 1,
			'Zamorak page 2': 1,
			'Zamorak page 3': 1,
			'Zamorak page 4': 1
		}),
		outputItems: transformStringBankToNum({
			'Unholy book': 1
		}),
		agilityLevel: 35,
		QPRequired: 5
	},
	{
		name: 'Book of law',
		inputItems: transformStringBankToNum({
			'Armadyl page 1': 1,
			'Armadyl page 2': 1,
			'Armadyl page 3': 1,
			'Armadyl page 4': 1
		}),
		outputItems: transformStringBankToNum({
			'Book of law': 1
		}),
		agilityLevel: 35,
		QPRequired: 5
	},
	{
		name: 'Book of war',
		inputItems: transformStringBankToNum({
			'Bandos page 1': 1,
			'Bandos page 2': 1,
			'Bandos page 3': 1,
			'Bandos page 4': 1
		}),
		outputItems: transformStringBankToNum({
			'Book of war': 1
		}),
		agilityLevel: 35,
		QPRequired: 5
	},
	{
		name: 'Book of darkness',
		inputItems: transformStringBankToNum({
			'Ancient page 1': 1,
			'Ancient page 2': 1,
			'Ancient page 3': 1,
			'Ancient page 4': 1
		}),
		outputItems: transformStringBankToNum({
			'Book of darkness': 1
		}),
		agilityLevel: 35,
		QPRequired: 5
	},
	{
		name: "Ava's accumulator",
		inputItems: transformStringBankToNum({
			'Steel arrow': 75
		}),
		outputItems: transformStringBankToNum({
			"Ava's accumulator": 1
		}),
		QPRequired: 30
	},
	{
		name: "Ava's assembler",
		inputItems: transformStringBankToNum({
			'Mithril arrow': 75,
			"Ava's accumulator": 1,
			"Vorkath's head": 1
		}),
		outputItems: transformStringBankToNum({
			"Ava's assembler": 1
		}),
		QPRequired: 205
	}
];

export default Misc;
