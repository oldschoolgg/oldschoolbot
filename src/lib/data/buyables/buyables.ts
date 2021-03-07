import { MAX_QP } from '../../constants';
import { ItemBank } from '../../types';
import { resolveNameBank } from '../../util';
import itemID from '../../util/itemID';

interface Buyable {
	name: string;
	outputItems: ItemBank;
	qpRequired?: number;
	gpCost?: number;
	itemCost?: ItemBank;
	aliases?: string[];
}

const constructionBuyables: Buyable[] = [
	{ name: 'Bolt of cloth', outputItems: resolveNameBank({ 'Bolt of cloth': 1 }), gpCost: 5000 },
	{
		name: 'Limestone brick',
		outputItems: resolveNameBank({ 'Limestone brick': 1 }),
		gpCost: 1000
	},
	{
		name: 'Gold leaf',
		outputItems: resolveNameBank({ 'Gold leaf': 1 }),
		gpCost: 500_000
	},
	{
		name: 'Marble block',
		outputItems: resolveNameBank({ 'Marble block': 1 }),
		gpCost: 1_000_000
	},
	{
		name: 'Magic stone',
		outputItems: resolveNameBank({ 'Magic stone': 1 }),
		gpCost: 4_000_000
	},
	{
		name: 'Red dye',
		outputItems: resolveNameBank({ 'Red dye': 1 }),
		gpCost: 100_000
	},
	{
		name: 'Skull',
		outputItems: resolveNameBank({ Skull: 1 }),
		gpCost: 100_000
	},
	{
		name: 'Fairy enchantment',
		outputItems: resolveNameBank({ 'Fairy enchantment': 1 }),
		gpCost: 100_000,
		qpRequired: 23
	},
	{
		name: 'Ancient signet',
		outputItems: resolveNameBank({ 'Ancient signet': 1 }),
		gpCost: 100_000,
		qpRequired: 105
	},
	{
		name: 'Lunar signet',
		outputItems: resolveNameBank({ 'Lunar signet': 1 }),
		gpCost: 100_000,
		qpRequired: 52
	},
	{
		name: 'Bucket of water',
		outputItems: resolveNameBank({ 'Bucket of water': 1 }),
		gpCost: 500
	}
];

const sepulchreBuyables: Buyable[] = [
	{
		name: 'Hallowed crystal shard',
		outputItems: resolveNameBank({ 'Hallowed crystal shard': 1 }),
		itemCost: resolveNameBank({ 'Hallowed mark': 1 })
	},
	{
		name: 'Hallowed token',
		outputItems: resolveNameBank({ 'Hallowed token': 1 }),
		itemCost: resolveNameBank({ 'Hallowed mark': 10 })
	},
	{
		name: 'Hallowed grapple',
		outputItems: resolveNameBank({ 'Hallowed grapple': 1 }),
		itemCost: resolveNameBank({ 'Hallowed mark': 100 })
	},
	{
		name: 'Hallowed focus',
		outputItems: resolveNameBank({ 'Hallowed focus': 1 }),
		itemCost: resolveNameBank({ 'Hallowed mark': 100 })
	},
	{
		name: 'Hallowed symbol',
		outputItems: resolveNameBank({ 'Hallowed symbol': 1 }),
		itemCost: resolveNameBank({ 'Hallowed mark': 100 })
	},
	{
		name: 'Hallowed hammer',
		outputItems: resolveNameBank({ 'Hallowed hammer': 1 }),
		itemCost: resolveNameBank({ 'Hallowed mark': 100 })
	},
	{
		name: 'Hallowed ring',
		outputItems: resolveNameBank({ 'Hallowed ring': 1 }),
		itemCost: resolveNameBank({ 'Hallowed mark': 250 })
	},
	{
		name: 'Dark dye',
		outputItems: resolveNameBank({ 'Dark dye': 1 }),
		itemCost: resolveNameBank({ 'Hallowed mark': 300 })
	},
	{
		name: 'Dark acorn',
		outputItems: resolveNameBank({ 'Dark acorn': 1 }),
		itemCost: resolveNameBank({ 'Hallowed mark': 3000 })
	},
	{
		name: 'Dark graceful hood',
		outputItems: resolveNameBank({ 'Dark graceful hood': 1 }),
		itemCost: resolveNameBank({ 'Graceful hood': 1, 'Dark dye': 1 })
	},
	{
		name: 'Dark graceful top',
		outputItems: resolveNameBank({ 'Dark graceful top': 1 }),
		itemCost: resolveNameBank({ 'Graceful top': 1, 'Dark dye': 1 })
	},
	{
		name: 'Dark graceful legs',
		outputItems: resolveNameBank({ 'Dark graceful legs': 1 }),
		itemCost: resolveNameBank({ 'Graceful legs': 1, 'Dark dye': 1 })
	},
	{
		name: 'Dark graceful gloves',
		outputItems: resolveNameBank({ 'Dark graceful gloves': 1 }),
		itemCost: resolveNameBank({ 'Graceful gloves': 1, 'Dark dye': 1 })
	},
	{
		name: 'Dark graceful boots',
		outputItems: resolveNameBank({ 'Dark graceful boots': 1 }),
		itemCost: resolveNameBank({ 'Graceful boots': 1, 'Dark dye': 1 })
	},
	{
		name: 'Dark graceful cape',
		outputItems: resolveNameBank({ 'Dark graceful cape': 1 }),
		itemCost: resolveNameBank({ 'Graceful cape': 1, 'Dark dye': 1 })
	},
	{
		name: 'Dark squirrel',
		outputItems: resolveNameBank({ 'Dark squirrel': 1 }),
		itemCost: resolveNameBank({ 'Dark acorn': 1, 'Giant squirrel': 1 })
	}
];

const hunterBuyables: Buyable[] = [
	{
		name: 'Butterfly jar',
		outputItems: {
			[itemID('Butterfly jar')]: 1
		},
		gpCost: 500
	},
	{
		name: 'Magic box',
		outputItems: {
			[itemID('Magic box')]: 1
		},
		gpCost: 1500
	}
];

const questBuyables: Buyable[] = [
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
		name: "Iban's staff",
		aliases: ['iban'],
		outputItems: {
			[itemID("Iban's staff")]: 1
		},
		qpRequired: 30,
		gpCost: 300_000
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
		name: 'Mythical cape',
		outputItems: {
			[itemID('Mythical cape')]: 1
		},
		gpCost: 1_000_000,
		qpRequired: 205
	},
	{
		name: 'Mind shield',
		outputItems: {
			[itemID('Mind shield')]: 1
		},
		gpCost: 100_000,
		qpRequired: 35
	},
	{
		name: 'Dwarven helmet',
		outputItems: {
			[itemID('Dwarven helmet')]: 1
		},
		gpCost: 100_000,
		qpRequired: 52
	},
	{
		name: 'Amulet of accuracy',
		outputItems: {
			[itemID('Amulet of accuracy')]: 1
		},
		gpCost: 50_000,
		qpRequired: 52
	},
	{
		name: 'Cape of legends',
		outputItems: {
			[itemID('Cape of legends')]: 1
		},
		gpCost: 250_000,
		qpRequired: 105
	},
	{
		name: 'Bearhead',
		outputItems: {
			[itemID('Bearhead')]: 1
		},
		gpCost: 1_000_000,
		qpRequired: 105
	},
	{
		name: 'Bonesack',
		outputItems: {
			[itemID('Bonesack')]: 1
		},
		gpCost: 1_000_000,
		qpRequired: 82
	},
	{
		name: 'Ram skull helm',
		outputItems: {
			[itemID('Ram skull helm')]: 1
		},
		gpCost: 1_000_000,
		qpRequired: 82
	},
	{
		name: 'Monkey',
		outputItems: {
			19556: 1
		},
		gpCost: 1_000_000,
		qpRequired: 182
	},
	{
		name: 'Rat pole',
		outputItems: {
			[itemID('Rat pole')]: 1
		},
		gpCost: 200_000,
		qpRequired: 85
	},
	{
		name: 'Darklight',
		outputItems: {
			[itemID('Darklight')]: 1
		},
		gpCost: 200_000,
		qpRequired: 58
	},
	{
		name: 'Lunar Outfit',
		outputItems: resolveNameBank({
			'Lunar boots': 1,
			'Lunar cape': 1,
			'Lunar gloves': 1,
			'Lunar helm': 1,
			'Lunar legs': 1,
			'Lunar torso': 1,
			'Lunar amulet': 1,
			'Lunar ring': 1,
			'Lunar staff': 1
		}),
		gpCost: 5_000_000,
		qpRequired: 120
	},
	{
		name: 'Lunar Outfit',
		outputItems: resolveNameBank({
			'Moonclan boots': 1,
			'Moonclan cape': 1,
			'Moonclan gloves': 1,
			'Moonclan helm': 1,
			'Moonclan hat': 1,
			'Moonclan skirt': 1,
			'Moonclan armour': 1
		}),
		gpCost: 5_000_000,
		qpRequired: 120
	}
];

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
		name: 'Fishing Bait',
		aliases: ['fishing bait'],
		outputItems: {
			[itemID('Fishing bait')]: 1
		},
		gpCost: 20
	},
	{
		name: 'Jug of Water',
		aliases: ['jug of water', 'jugs of water'],
		outputItems: {
			[itemID('Jug of water')]: 1
		},
		gpCost: 100
	},

	{
		name: 'Feather',
		aliases: ['feather'],
		outputItems: {
			[itemID('Feather')]: 1
		},
		gpCost: 50
	},
	{
		name: 'Shield right half',
		aliases: ['shield right half', 'right shield'],
		outputItems: resolveNameBank({
			'Shield right half': 1
		}),
		qpRequired: 111,
		gpCost: 1_000_000
	},
	{
		name: 'Eye of newt',
		aliases: ['eye of newt', 'newt eye'],
		outputItems: resolveNameBank({
			'Eye of newt': 1
		}),
		gpCost: 300
	},
	{
		name: 'Vial of water',
		aliases: ['vial of water'],
		outputItems: resolveNameBank({
			'Vial of water': 1
		}),
		gpCost: 60
	},
	{
		name: 'Vial',
		aliases: ['vial'],
		outputItems: resolveNameBank({
			Vial: 1
		}),
		gpCost: 30
	},
	{
		name: 'Cup of hot water',
		aliases: ['cup of hot water', 'hot water'],
		outputItems: resolveNameBank({
			'Cup of hot water': 1
		}),
		gpCost: 1500
	},
	{
		name: 'Chocolate bar',
		aliases: ['chocolate bar', 'chocolate'],
		outputItems: resolveNameBank({
			'Chocolate bar': 1
		}),
		gpCost: 1000
	},
	{
		name: 'Ball of wool',
		aliases: ['wool ball', 'ball wool'],
		outputItems: {
			[itemID('Ball of wool')]: 1
		},
		gpCost: 300
	},
	{
		name: 'Compost',
		outputItems: {
			[itemID('Compost')]: 1
		},
		gpCost: 400
	},
	{
		name: 'Amylase pack',
		outputItems: {
			[itemID('Amylase crystal')]: 100
		},
		itemCost: resolveNameBank({ 'Mark of grace': 10 })
	},
	...sepulchreBuyables,
	...constructionBuyables,
	...hunterBuyables,
	...questBuyables
];

export default Buyables;
