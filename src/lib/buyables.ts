import { Bank } from './types';
import itemID from './util/itemID';
import { MAX_QP } from './constants';

interface Buyable {
	name: string;
	outputItems: Bank;
	qpRequired: number;
	gpCost: number;
}

const Buyables: Buyable[] = [
	{
		name: 'Quest Cape',
		outputItems: {
			[itemID('Quest point cape')]: 1,
			[itemID('Quest point hood')]: 1
		},
		qpRequired: MAX_QP,
		gpCost: 99_000
	},
	{
		name: 'Goldsmith gauntlets',
		outputItems: {
			[itemID('Goldsmith gauntlets')]: 1
		},
		qpRequired: 25,
		gpCost: 1_000_000
	},
	{
		name: 'Cooking gauntlets',
		outputItems: {
			[itemID('Cooking gauntlets')]: 1
		},
		qpRequired: 25,
		gpCost: 1_000_000
	},
	{
		name: 'Anti-dragon shield',
		outputItems: {
			[itemID('Anti-dragon shield')]: 1
		},
		qpRequired: 35,
		gpCost: 10_000
	},
	{
		name: 'Hardleather gloves',
		outputItems: {
			[itemID('Hardleather gloves')]: 1
		},
		qpRequired: 1,
		gpCost: 1
	},
	{
		name: 'Bronze gloves',
		outputItems: {
			[itemID('Bronze gloves')]: 1
		},
		qpRequired: 1,
		gpCost: 1
	},
	{
		name: 'Iron gloves',
		outputItems: {
			[itemID('Iron gloves')]: 1
		},
		qpRequired: 1,
		gpCost: 1
	},
	{
		name: 'Steel gloves',
		outputItems: {
			[itemID('Steel gloves')]: 1
		},
		qpRequired: 1,
		gpCost: 1
	},
	{
		name: 'Black gloves',
		outputItems: {
			[itemID('Black gloves')]: 1
		},
		qpRequired: 1,
		gpCost: 1
	},
	{
		name: 'Mithril gloves',
		outputItems: {
			[itemID('Mithril gloves')]: 1
		},
		qpRequired: 1,
		gpCost: 1
	},
	{
		name: 'Adamant gloves',
		outputItems: {
			[itemID('Adamant gloves')]: 1
		},
		qpRequired: 1,
		gpCost: 1
	},
	{
		name: 'Rune gloves',
		outputItems: {
			[itemID('Rune gloves')]: 1
		},
		qpRequired: 1,
		gpCost: 1
	},
	{
		name: 'Dragon gloves',
		outputItems: {
			[itemID('Dragon gloves')]: 1
		},
		qpRequired: 1,
		gpCost: 1
	},
	{
		name: 'Barrows gloves',
		outputItems: {
			[itemID('Barrows gloves')]: 1
		},
		qpRequired: 175,
		gpCost: 1_000_000
	},
	{
		name: 'Helm of neitiznot',
		outputItems: {
			[itemID('Helm of neitiznot')]: 1
		},
		qpRequired: 75,
		gpCost: 500_000
	},
	{
		name: 'Magic secateurs',
		outputItems: {
			[itemID('Magic secateurs')]: 1
		},
		qpRequired: 40,
		gpCost: 2_500_000
	}
];

export default Buyables;
