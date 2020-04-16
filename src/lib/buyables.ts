import { Bank } from './types';
import itemID from './util/itemID';
import { MAX_QP } from './constants';

interface Buyable {
	name: string;
	outputItems: Bank;
	qpRequired: number;
	gpCost: number;
	aliases?: string[];
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
		qpRequired: 5,
		gpCost: 50_000
	},
	{
		name: 'Bronze gloves',
		outputItems: {
			[itemID('Bronze gloves')]: 1
		},
		qpRequired: 10,
		gpCost: 100_000
	},
	{
		name: 'Iron gloves',
		outputItems: {
			[itemID('Iron gloves')]: 1
		},
		qpRequired: 20,
		gpCost: 200_000
	},
	{
		name: 'Steel gloves',
		outputItems: {
			[itemID('Steel gloves')]: 1
		},
		qpRequired: 25,
		gpCost: 300_000
	},
	{
		name: 'Black gloves',
		outputItems: {
			[itemID('Black gloves')]: 1
		},
		qpRequired: 35,
		gpCost: 400_000
	},
	{
		name: 'Mithril gloves',
		outputItems: {
			[itemID('Mithril gloves')]: 1
		},
		qpRequired: 50,
		gpCost: 500_000
	},
	{
		name: 'Adamant gloves',
		outputItems: {
			[itemID('Adamant gloves')]: 1
		},
		qpRequired: 65,
		gpCost: 600_000
	},
	{
		name: 'Rune gloves',
		outputItems: {
			[itemID('Rune gloves')]: 1
		},
		qpRequired: 85,
		gpCost: 700_000
	},
	{
		name: 'Dragon gloves',
		outputItems: {
			[itemID('Dragon gloves')]: 1
		},
		qpRequired: 107,
		gpCost: 850_000
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
	},
	{
		name: 'Huge Fishing Bait Pack',
		aliases: ['fishing bait'],
		outputItems: {
			[itemID('Fishing bait')]: 10_000
		},
		qpRequired: 0,
		gpCost: 10_000 * 5
	},
	{
		name: 'Enchanted gem',
		aliases: ['enchanted', 'gem'],
		outputItems: {
			[itemID('Enchanted gem')]: 1
		},
		qpRequired: 0,
		gpCost: 100_000
	},
	{
		name: 'Leaf-bladed spear',
		aliases: ['leafbladed spear', 'leaf spear'],
		outputItems: {
			[itemID('Leaf-bladed spear')]: 1
		},
		qpRequired: 0,
		gpCost: 250_000
	},
	{
		name: 'Mirror shield',
		aliases: ['mirror'],
		outputItems: {
			[itemID('Mirror shield')]: 1
		},
		qpRequired: 0,
		gpCost: 100_000
	},
	{
		name: 'Rock hammer',
		aliases: ['rock'],
		outputItems: {
			[itemID('Rock hammer')]: 1
		},
		qpRequired: 0,
		gpCost: 100_000
	},
	{
		name: 'Face mask',
		aliases: ['face'],
		outputItems: {
			[itemID('Face mask')]: 1
		},
		qpRequired: 0,
		gpCost: 100_000
	},
	{
		name: 'Earmuffs',
		aliases: ['earmuff'],
		outputItems: {
			[itemID('Earmuffs')]: 1
		},
		qpRequired: 0,
		gpCost: 100_000
	},
	{
		name: 'Nose peg',
		aliases: ['nose'],
		outputItems: {
			[itemID('Nose peg')]: 1
		},
		qpRequired: 0,
		gpCost: 100_000
	},
	{
		name: 'Spiny helmet',
		aliases: ['spiny'],
		outputItems: {
			[itemID('Spiny helmet')]: 1
		},
		qpRequired: 0,
		gpCost: 100_000
	},
	{
		name: 'Slayer gloves',
		aliases: ['slay gloves'],
		outputItems: {
			[itemID('Slayer gloves')]: 1
		},
		qpRequired: 0,
		gpCost: 100_000
	},
	{
		name: 'Witchwood icon',
		aliases: ['witchwood'],
		outputItems: {
			[itemID('Witchwood icon')]: 1
		},
		qpRequired: 0,
		gpCost: 100_000
	},
	{
		name: 'Boots of stone',
		aliases: ['stone boots'],
		outputItems: {
			[itemID('Boots of stone')]: 1
		},
		qpRequired: 0,
		gpCost: 100_000
	}
];

export default Buyables;
