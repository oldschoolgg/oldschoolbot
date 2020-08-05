import { Bank } from './types';
import itemID from './util/itemID';
import { MAX_QP } from './constants';
import { resolveNameBank } from './util';

interface Buyable {
	name: string;
	requiredItems?: Bank;
	outputItems: Bank;
	qpRequired: number;
	gpCost: number;
	aliases?: string[];
	commendationPoints?: number;
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
		name: 'Void knight gloves',
		aliases: ['void knight gloves', 'void gloves'],
		outputItems: resolveNameBank({
			'Void knight gloves': 1
		}),
		qpRequired: 0,
		gpCost: 0,
		commendationPoints: 150
	},
	{
		name: 'Void seal',
		aliases: ['void knight seal', 'void seal'],
		outputItems: resolveNameBank({
			'Void seal(8)': 1
		}),
		qpRequired: 0,
		gpCost: 0,
		commendationPoints: 10
	},
	{
		name: 'Void knight mace',
		aliases: ['void knight mace', 'void mace'],
		outputItems: resolveNameBank({
			'Void knight mace': 1
		}),
		qpRequired: 0,
		gpCost: 0,
		commendationPoints: 250
	},
	{
		name: 'Void knight robe',
		aliases: ['void knight robe', 'void robe', 'void bottom'],
		outputItems: resolveNameBank({
			'Void knight robe': 1
		}),
		qpRequired: 0,
		gpCost: 0,
		commendationPoints: 250
	},
	{
		name: 'Void knight top',
		aliases: ['void knight top', 'void top'],
		outputItems: resolveNameBank({
			'Void knight top': 1
		}),
		qpRequired: 0,
		gpCost: 0,
		commendationPoints: 250
	},
	{
		name: 'Void melee helm ',
		aliases: ['void melee helm', 'void melee'],
		outputItems: resolveNameBank({
			'Void melee helm': 1
		}),
		qpRequired: 0,
		gpCost: 0,
		commendationPoints: 200
	},
	{
		name: 'Void mage helm ',
		aliases: ['void mage helm', 'void mage'],
		outputItems: resolveNameBank({
			'Void mage helm': 1
		}),
		qpRequired: 0,
		gpCost: 0,
		commendationPoints: 200
	},
	{
		name: 'Void ranger helm ',
		aliases: ['void ranger helm', 'void range helm', 'void range'],
		outputItems: resolveNameBank({
			'Void ranger helm': 1
		}),
		qpRequired: 0,
		gpCost: 0,
		commendationPoints: 200
	},
	{
		name: 'Elite void robe',
		aliases: ['elite void robe', 'elite robe', 'elite bottom'],
		requiredItems: resolveNameBank({
			'Void knight robe': 1
		}),
		outputItems: resolveNameBank({
			'Elite void robe': 1
		}),
		qpRequired: 0,
		gpCost: 0,
		commendationPoints: 200
	},
	{
		name: 'Elite void top',
		aliases: ['elite void top', 'elite top', 'elite top'],
		requiredItems: resolveNameBank({
			'Void knight top': 1
		}),
		outputItems: resolveNameBank({
			'Elite void top': 1
		}),
		qpRequired: 0,
		gpCost: 0,
		commendationPoints: 200
	}
];

export default Buyables;
