import { Bank } from './types';
import itemID from './util/itemID';
import { MAX_QP } from './constants';
import { resolveNameBank } from './util';

interface Buyable {
	name: string;
	outputItems: Bank;
	qpRequired: number;
	gpCost: number;
	aliases?: string[];
	titheFarmPoints?: number;
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
		name: 'Fishing Bait',
		aliases: ['fishing bait'],
		outputItems: {
			[itemID('Fishing bait')]: 1
		},
		qpRequired: 0,
		gpCost: 5
	},
	{
		name: 'Jug of Water',
		aliases: ['jug of water', 'jugs of water'],
		outputItems: {
			[itemID('Jug of water')]: 1
		},
		qpRequired: 0,
		gpCost: 100
	},
	{
		name: "Iban's staff",
		aliases: ['iban'],
		outputItems: {
			[itemID("Iban's staff")]: 1
		},
		qpRequired: 30,
		gpCost: 250_000
	},
	{
		name: 'Barrelchest anchor',
		aliases: ['anchor'],
		outputItems: {
			[itemID('Barrelchest anchor')]: 1
		},
		qpRequired: 30,
		gpCost: 2_000_000
	},
	{
		name: 'Feather',
		aliases: ['feather'],
		outputItems: {
			[itemID('Feather')]: 1
		},
		qpRequired: 0,
		gpCost: 10
	},
	{
		name: 'Shield right half',
		aliases: ['shield right half', 'right shield'],
		outputItems: resolveNameBank({
			'Shield right half': 1
		}),
		qpRequired: 111,
		gpCost: 750_000
	},
	{
		name: 'Compost',
		outputItems: {
			[itemID('Compost')]: 1
		},
		qpRequired: 0,
		gpCost: 20
	},
	{
		name: 'Magic secateurs',
		outputItems: {
			[itemID('Magic secateurs')]: 1
		},
		qpRequired: 10,
		gpCost: 40_000
	},
	{
		name: `Farmer's strawhat`,
		aliases: ['Farmers strawhat', 'farmers hat', `farmer's hat`],
		outputItems: {
			[itemID(`Farmer's strawhat`)]: 1
		},
		qpRequired: 0,
		gpCost: 0,
		titheFarmPoints: 75
	},
	{
		name: `Farmer's jacket`,
		aliases: ['Farmers jacket'],
		outputItems: {
			[itemID(`Farmer's jacket`)]: 1
		},
		qpRequired: 0,
		gpCost: 0,
		titheFarmPoints: 150
	},
	{
		name: `Farmer's shirt`,
		aliases: ['Farmers shirt'],
		outputItems: {
			[itemID(`Farmer's shirt`)]: 1
		},
		qpRequired: 0,
		gpCost: 0,
		titheFarmPoints: 150
	},
	{
		name: `Farmer's boro trousers`,
		aliases: ['Farmers trousers', 'farmers bottoms', `farmer's trousers`],
		outputItems: {
			[itemID(`Farmer's boro trousers`)]: 1
		},
		qpRequired: 0,
		gpCost: 0,
		titheFarmPoints: 125
	},
	{
		name: `Farmer's boots`,
		aliases: ['Farmers boots'],
		outputItems: {
			[itemID(`Farmer's boots`)]: 1
		},
		qpRequired: 0,
		gpCost: 0,
		titheFarmPoints: 50
	}
];

export default Buyables;
