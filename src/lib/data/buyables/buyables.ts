import { User } from '@prisma/client';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { chompyHats } from '../../../mahoji/lib/abstracted_commands/chompyHuntCommand';
import { soteSkillRequirements } from '../../../mahoji/lib/abstracted_commands/zalcanoCommand';
import { MAX_QP } from '../../constants';
import { diaries, userhasDiaryTier } from '../../diaries';
import { Favours } from '../../minions/data/kourendFavour';
import { MinigameName } from '../../settings/settings';
import { Skills } from '../../types';
import getOSItem from '../../util/getOSItem';
import { aerialFishBuyables } from './aerialFishBuyables';
import { bsoBuyables } from './bsoBuyables';
import { canifisClothes } from './canifisClothes';
import { capeBuyables } from './capes';
import { castleWarsBuyables } from './castleWars';
import { fremennikClothes } from './frem';
import { gnomeClothes } from './gnomeClothes';
import { miningBuyables } from './mining';
import { monkeyRumbleBuyables } from './monkeyRumbleBuyables';
import { perduBuyables } from './perdu';
import { runeBuyables } from './runes';
import { shootingStarsBuyables } from './shootingStarsBuyables';
import { skillCapeBuyables } from './skillCapeBuyables';
import { slayerBuyables } from './slayerBuyables';
import { troubleBrewingBuyables } from './troubleBrewingShop';

export interface Buyable {
	name: string;
	outputItems?: Bank | ((user: User) => Bank);
	qpRequired?: number;
	gpCost?: number;
	itemCost?: Bank;
	aliases?: string[];
	skillsNeeded?: Skills;
	requiredFavour?: Favours;
	restockTime?: number;
	minigameScoreReq?: [MinigameName, number];
	ironmanPrice?: number;
	collectionLogReqs?: number[];
	customReq?: (user: KlasaUser) => Promise<[true] | [false, string]>;
}

const randomEventBuyables: Buyable[] = [
	{
		name: 'Prince outfit',
		itemCost: new Bank({
			'Frog token': 1
		}),
		outputItems: new Bank({
			'Prince tunic': 1,
			'Prince leggings': 1
		})
	},
	{
		name: 'Princess outfit',
		itemCost: new Bank({
			'Frog token': 1
		}),
		outputItems: new Bank({
			'Princess blouse': 1,
			'Princess skirt': 1
		})
	},
	{
		name: 'Frog mask',
		itemCost: new Bank({
			'Frog token': 1
		}),
		outputItems: new Bank({
			'Frog mask': 1
		})
	}
];

const ironmenBuyables: Buyable[] = ['Ironman helm', 'Ironman platebody', 'Ironman platelegs'].map(str => ({
	name: str,
	customReq: async (user: KlasaUser) => {
		return user.isIronman ? [true] : [false, 'Only ironmen can buy this.'];
	},
	gpCost: 1000
}));

const tobCapes: Buyable[] = [
	{
		name: 'Sinhaza shroud tier 1',
		gpCost: 100_000,
		minigameScoreReq: ['tob', 100]
	},
	{
		name: 'Sinhaza shroud tier 2',
		gpCost: 500_000,
		minigameScoreReq: ['tob', 500]
	},
	{
		name: 'Sinhaza shroud tier 3',
		gpCost: 500_000,
		minigameScoreReq: ['tob', 1000]
	},
	{
		name: 'Sinhaza shroud tier 4',
		gpCost: 500_000,
		minigameScoreReq: ['tob', 1500]
	},
	{
		name: 'Sinhaza shroud tier 5',
		gpCost: 500_000,
		minigameScoreReq: ['tob', 2000]
	}
];

const cmCapes: Buyable[] = [
	{
		name: "Xeric's guard",
		gpCost: 100_000,
		minigameScoreReq: ['raids_challenge_mode', 100]
	},
	{
		name: "Xeric's warrior",
		gpCost: 500_000,
		minigameScoreReq: ['raids_challenge_mode', 500]
	},
	{
		name: "Xeric's sentinel",
		gpCost: 1_000_000,
		minigameScoreReq: ['raids_challenge_mode', 1000]
	},
	{
		name: "Xeric's general",
		gpCost: 1_500_000,
		minigameScoreReq: ['raids_challenge_mode', 1500]
	},
	{
		name: "Xeric's champion",
		gpCost: 2_000_000,
		minigameScoreReq: ['raids_challenge_mode', 2000]
	}
];

const constructionBuyables: Buyable[] = [
	{ name: 'Bolt of cloth', outputItems: new Bank({ 'Bolt of cloth': 1 }), gpCost: 5000 },
	{
		name: 'Limestone brick',
		gpCost: 1000,
		ironmanPrice: 40
	},
	{
		name: 'Gold leaf',
		gpCost: 500_000,
		ironmanPrice: 130_000
	},
	{
		name: 'Marble block',
		gpCost: 1_000_000,
		ironmanPrice: 325_000
	},
	{
		name: 'Magic stone',
		gpCost: 4_000_000,
		ironmanPrice: 975_000
	},
	{
		name: 'Red dye',
		gpCost: 100_000,
		ironmanPrice: 25
	},
	{
		name: 'Skull',
		gpCost: 100_000
	},
	{
		name: 'Fairy enchantment',
		gpCost: 100_000,
		ironmanPrice: 100,
		qpRequired: 23
	},
	{
		name: 'Arceuus signet',
		gpCost: 100_000,
		requiredFavour: Favours.Arceuus
	},
	{
		name: 'Ancient signet',
		gpCost: 100_000,
		qpRequired: 105
	},
	{
		name: 'Lunar signet',
		gpCost: 100_000,
		qpRequired: 52
	},
	{
		name: 'Bucket of water',
		gpCost: 500,
		ironmanPrice: 7
	}
];

const sepulchreBuyables: Buyable[] = [
	{
		name: 'Hallowed crystal shard',
		itemCost: new Bank({ 'Hallowed mark': 1 })
	},
	{
		name: 'Hallowed token',
		itemCost: new Bank({ 'Hallowed mark': 10 })
	},
	{
		name: 'Hallowed grapple',
		itemCost: new Bank({ 'Hallowed mark': 100 })
	},
	{
		name: 'Hallowed focus',
		itemCost: new Bank({ 'Hallowed mark': 100 })
	},
	{
		name: 'Hallowed symbol',
		itemCost: new Bank({ 'Hallowed mark': 100 })
	},
	{
		name: 'Hallowed hammer',
		itemCost: new Bank({ 'Hallowed mark': 100 })
	},
	{
		name: 'Hallowed sack',
		itemCost: new Bank({ 'Hallowed mark': 100 })
	},
	{
		name: 'Hallowed ring',
		itemCost: new Bank({ 'Hallowed mark': 250 })
	},
	{
		name: 'Dark dye',
		itemCost: new Bank({ 'Hallowed mark': 300 })
	},
	{
		name: 'Dark acorn',
		outputItems: new Bank({ 'Dark acorn': 1 }),
		itemCost: new Bank({ 'Hallowed mark': 3000 })
	},
	{
		name: 'Dark squirrel',
		itemCost: new Bank({ 'Dark acorn': 1, 'Giant squirrel': 1 })
	}
];

const hunterBuyables: Buyable[] = [
	{
		name: 'Butterfly jar',
		gpCost: 500
	},
	{
		name: 'Magic box',
		gpCost: 1500
	}
];

const magicBuyables: Buyable[] = [
	{
		name: 'Mystic hat',
		gpCost: 15_000,
		skillsNeeded: {
			magic: 66
		}
	},
	{
		name: 'Mystic robe top',
		gpCost: 120_000,
		skillsNeeded: {
			magic: 66
		}
	},
	{
		name: 'Mystic robe bottom',
		gpCost: 80_000,
		skillsNeeded: {
			magic: 66
		}
	},
	{
		name: 'Mystic gloves',
		gpCost: 10_000,
		skillsNeeded: {
			magic: 66
		}
	},
	{
		name: 'Mystic boots',
		gpCost: 10_000,
		skillsNeeded: {
			magic: 66
		}
	}
];

const questBuyables: Buyable[] = [
	{
		name: 'Goldsmith gauntlets',
		outputItems: new Bank({
			'Goldsmith gauntlets': 1
		}),
		qpRequired: 25,
		gpCost: 1_000_000,
		ironmanPrice: 25_000
	},
	{
		name: 'Cooking gauntlets',
		qpRequired: 25,
		gpCost: 1_000_000,
		ironmanPrice: 25_000
	},
	{
		name: 'Anti-dragon shield',
		qpRequired: 35,
		gpCost: 10_000
	},
	{
		name: 'Hardleather gloves',
		qpRequired: 5,
		gpCost: 50_000,
		ironmanPrice: 65
	},
	{
		name: 'Bronze gloves',
		qpRequired: 10,
		gpCost: 100_000,
		ironmanPrice: 130
	},
	{
		name: 'Iron gloves',
		qpRequired: 20,
		gpCost: 200_000,
		ironmanPrice: 325
	},
	{
		name: 'Steel gloves',
		qpRequired: 25,
		gpCost: 300_000,
		ironmanPrice: 650
	},
	{
		name: 'Black gloves',
		qpRequired: 35,
		gpCost: 400_000,
		ironmanPrice: 1000
	},
	{
		name: 'Mithril gloves',
		qpRequired: 50,
		gpCost: 500_000,
		ironmanPrice: 2000
	},
	{
		name: 'Adamant gloves',
		qpRequired: 65,
		gpCost: 600_000,
		ironmanPrice: 3250
	},
	{
		name: 'Rune gloves',
		outputItems: new Bank({
			'Rune gloves': 1
		}),
		qpRequired: 85,
		gpCost: 700_000,
		ironmanPrice: 6500
	},
	{
		name: 'Dragon gloves',
		qpRequired: 107,
		gpCost: 850_000,
		ironmanPrice: 130_000
	},
	{
		name: 'Barrows gloves',
		qpRequired: 175,
		gpCost: 1_000_000,
		ironmanPrice: 130_000
	},
	{
		name: 'Helm of neitiznot',
		qpRequired: 75,
		gpCost: 500_000,
		ironmanPrice: 50_000
	},
	{
		name: 'Magic secateurs',
		qpRequired: 40,
		gpCost: 2_500_000,
		ironmanPrice: 40_000
	},
	{
		name: "Iban's staff",
		aliases: ['iban'],
		qpRequired: 30,
		gpCost: 300_000
	},
	{
		name: 'Barrelchest anchor',
		aliases: ['anchor'],
		qpRequired: 30,
		gpCost: 2_000_000
	},
	{
		name: 'Mythical cape',
		gpCost: 1_000_000,
		qpRequired: 205,
		ironmanPrice: 10_000
	},
	{
		name: 'Mind shield',
		gpCost: 100_000,
		qpRequired: 35
	},
	{
		name: 'Dwarven helmet',
		gpCost: 100_000,
		qpRequired: 52
	},
	{
		name: 'Amulet of accuracy',
		gpCost: 50_000,
		qpRequired: 5
	},
	{
		name: 'Cape of legends',
		gpCost: 250_000,
		qpRequired: 105
	},
	{
		name: 'Bearhead',
		gpCost: 1_000_000,
		qpRequired: 105
	},
	{
		name: 'Bonesack',
		gpCost: 1_000_000,
		qpRequired: 82
	},
	{
		name: 'Ram skull helm',
		gpCost: 1_000_000,
		qpRequired: 82
	},
	{
		name: 'Monkey',
		outputItems: new Bank({
			19_556: 1
		}),
		gpCost: 1_000_000,
		qpRequired: 182
	},
	{
		name: 'Rat pole',
		gpCost: 200_000,
		qpRequired: 85
	},
	{
		name: 'Silverlight',
		gpCost: 50_000,
		qpRequired: 3
	},
	{
		name: 'Darklight',
		gpCost: 200_000,
		qpRequired: 58
	},
	{
		name: 'Lunar Outfit',
		outputItems: new Bank({
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
		name: 'Moonclan Outfit',
		outputItems: new Bank({
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
	},
	{
		name: 'Jester Outfit',
		outputItems: new Bank({
			'Silly jester hat': 1,
			'Silly jester top': 1,
			'Silly jester tights': 1,
			'Silly jester boots': 1
		}),
		gpCost: 5_000_000,
		qpRequired: 89
	},
	{
		name: 'Ardougne Knight Outfit',
		outputItems: new Bank({
			'Ardougne knight helm': 1,
			'Ardougne knight platebody': 1,
			'Ardougne knight platelegs': 1
		}),
		gpCost: 5_000_000,
		qpRequired: 200
	},
	{
		name: 'Desert Outfit',
		outputItems: new Bank({
			Fez: 1,
			'Desert top': 1,
			'Desert legs': 1,
			'Desert robes': 1,
			'Desert boots': 1,
			'Desert shirt': 1,
			'Desert robe': 1
		}),
		gpCost: 1_000_000,
		qpRequired: 20
	},
	{
		name: 'Pirate boots',
		outputItems: new Bank({
			'Pirate boots': 1
		}),
		gpCost: 100_000,
		qpRequired: 20
	},
	{
		name: 'Vyrewatch outfit',
		outputItems: new Bank({
			'Vyrewatch top': 1,
			'Vyrewatch legs': 1,
			'Vyrewatch shoes': 1
		}),
		gpCost: 1_000_000,
		qpRequired: 92
	},
	{
		name: 'Climbing boots',
		outputItems: new Bank({
			'Climbing boots': 1
		}),
		gpCost: 100_000,
		qpRequired: 20
	},
	{
		name: 'Warrior helm',
		gpCost: 780_000,
		qpRequired: 60,
		ironmanPrice: 78_000
	},
	{
		name: 'Berserker helm',
		gpCost: 780_000,
		qpRequired: 60,
		ironmanPrice: 78_000
	},
	{
		name: 'Archer helm',
		gpCost: 780_000,
		qpRequired: 60,
		ironmanPrice: 78_000
	},
	{
		name: 'Farseer helm',
		gpCost: 780_000,
		qpRequired: 60,
		ironmanPrice: 78_000
	},
	{
		name: "Doctor's hat",
		gpCost: 60_000,
		qpRequired: 60
	},
	{
		name: 'Medical gown',
		gpCost: 60_000,
		qpRequired: 60
	},
	{
		name: 'Ring of charos',
		gpCost: 100_000,
		qpRequired: 60
	},
	{
		name: 'Nurse hat',
		gpCost: 60_000,
		qpRequired: 60
	},
	{
		name: 'Holy wrench',
		gpCost: 70_000,
		qpRequired: 70
	},
	{
		name: 'Initiate outfit',
		outputItems: new Bank({
			'Initiate sallet': 1,
			'Initiate hauberk': 1,
			'Initiate cuisse': 1
		}),
		gpCost: 250_000,
		qpRequired: 35
	},
	{
		name: 'Proselyte outfit',
		outputItems: new Bank({
			'Proselyte sallet': 1,
			'Proselyte hauberk': 1,
			'Proselyte cuisse': 1,
			'Proselyte tasset': 1
		}),
		gpCost: 500_000,
		qpRequired: 75
	},
	{
		name: 'Excalibur',
		gpCost: 50_000,
		qpRequired: 15
	},
	{
		name: 'Bomber jacket',
		gpCost: 50_000,
		qpRequired: 21
	},
	{
		name: 'Bomber cap',
		gpCost: 50_000,
		qpRequired: 21
	},
	{
		name: 'Pet rock',
		gpCost: 500_000,
		qpRequired: 60
	},
	{
		name: 'Dwarf multicannon',
		outputItems: new Bank({
			'Cannon barrels': 1,
			'Cannon base': 1,
			'Cannon furnace': 1,
			'Cannon stand': 1
		}).freeze(),
		gpCost: 10_000_000,
		qpRequired: 5,
		ironmanPrice: 750_000
	},
	{
		name: 'Cannon barrels',
		outputItems: new Bank({
			'Cannon barrels': 1
		}),
		gpCost: 2_500_000,
		qpRequired: 5,
		ironmanPrice: 200_625
	},
	{
		name: 'Cannon base',
		outputItems: new Bank({
			'Cannon base': 1
		}),
		gpCost: 2_500_000,
		qpRequired: 5,
		ironmanPrice: 200_625
	},
	{
		name: 'Cannon furnace',
		outputItems: new Bank({
			'Cannon furnace': 1
		}),
		gpCost: 2_500_000,
		qpRequired: 5,
		ironmanPrice: 200_625
	},
	{
		name: 'Cannon stand',
		outputItems: new Bank({
			'Cannon stand': 1
		}),
		gpCost: 2_500_000,
		qpRequired: 5,
		ironmanPrice: 200_625
	},
	{
		name: 'Elemental shield',
		gpCost: 2_500_000,
		qpRequired: 25,
		ironmanPrice: 2000
	}
];

const noveltyFood: Buyable[] = [
	{
		name: 'Beer',
		gpCost: 1_000_000
	},
	{
		name: 'Vodka',
		gpCost: 1_000_000
	},
	{
		name: 'Gin',
		gpCost: 1_000_000
	}
];

const Buyables: Buyable[] = [
	{
		name: 'Quest point cape',
		outputItems: new Bank({
			'Quest point cape': 1,
			'Quest point hood': 1
		}),
		aliases: ['quest cape'],
		qpRequired: MAX_QP,
		gpCost: 99_000
	},
	{
		name: 'Fishing Bait',
		aliases: ['fishing bait'],
		gpCost: 20,
		ironmanPrice: 3
	},
	{
		name: 'Jug of Water',
		aliases: ['jug of water', 'jugs of water'],
		gpCost: 100
	},

	{
		name: 'Feather',
		aliases: ['feather'],
		gpCost: 50,
		ironmanPrice: 2
	},
	{
		name: 'Shield right half',
		aliases: ['shield right half', 'right shield'],
		qpRequired: 111,
		gpCost: 1_000_000
	},
	{
		name: 'Dragon metal shard',
		aliases: ['metal shard'],
		qpRequired: 205,
		gpCost: 2_500_000
	},
	{
		name: 'Eye of newt',
		aliases: ['eye of newt', 'newt eye'],
		gpCost: 300,
		ironmanPrice: 3
	},
	{
		name: 'Vial of water',
		aliases: ['vial of water'],
		gpCost: 60,
		ironmanPrice: 3
	},
	{
		name: 'Vial',
		aliases: ['vial'],
		gpCost: 30,
		ironmanPrice: 2
	},
	{
		name: 'Cup of hot water',
		aliases: ['cup of hot water', 'hot water'],
		gpCost: 1500
	},
	{
		name: 'Chocolate bar',
		aliases: ['chocolate bar', 'chocolate'],
		gpCost: 1000
	},
	{
		name: 'Ball of wool',
		aliases: ['wool ball', 'ball wool'],
		gpCost: 300
	},
	{
		name: 'Empty bucket pack',
		outputItems: new Bank({
			Bucket: 100
		}),
		gpCost: 10_000
	},
	{
		name: 'Compost',
		outputItems: new Bank({
			Compost: 1
		}),
		gpCost: 500
	},
	{
		name: 'Bank lottery ticket',
		outputItems: new Bank({
			'Bank lottery ticket': 1
		}),
		gpCost: 10_000_000
	},
	{
		name: 'Amylase pack',
		outputItems: new Bank({
			'Amylase crystal': 100
		}),
		itemCost: new Bank({ 'Mark of grace': 10 })
	},
	{
		name: 'Dragon scimitar',
		gpCost: 500_000,
		qpRequired: 105
	},
	{
		name: 'Fishbowl pet',
		outputItems: new Bank({
			6672: 1
		}),
		gpCost: 500_000
	},
	{
		name: 'Potato with cheese',
		outputItems: new Bank({
			'Potato with cheese': 1
		}),
		gpCost: 1666,
		skillsNeeded: {
			attack: 65,
			strength: 65
		}
	},
	{
		name: 'Torstol',
		itemCost: new Bank({ 'Torstol potion (unf)': 1 })
	},
	{
		name: 'Ogre bow',
		outputItems: new Bank({
			'Ogre bow': 1
		}),
		gpCost: 10_000
	},
	{
		name: "M'speak amulet",
		gpCost: 100_000
	},
	{
		name: 'Achievement diary cape',
		outputItems: new Bank({
			'Achievement diary cape': 1,
			'Achievement diary cape(t)': 1,
			'Achievement diary hood': 1
		}),
		gpCost: 1_000_000,
		customReq: async user => {
			for (const diary of diaries.map(d => d.elite)) {
				const [has] = await userhasDiaryTier(user, diary);
				if (!has) {
					return [false, "You can't buy this because you haven't completed all the Elite diaries!"];
				}
			}
			return [true];
		}
	},
	{
		name: 'Salve amulet',
		gpCost: 200_000,
		skillsNeeded: {
			crafting: 35
		},
		qpRequired: 58
	},
	{
		name: 'Sandworms',
		gpCost: 500
	},
	{
		name: 'Festive present',
		gpCost: 100_000_000,
		itemCost: new Bank().add('Festive wrapping paper', 10)
	},
	{
		name: 'Granite Body',
		gpCost: 95_000,
		minigameScoreReq: ['barb_assault', 10]
	},
	{
		name: 'Raw shark',
		itemCost: new Bank({
			Minnow: 40
		}),
		outputItems: new Bank({
			'Raw shark': 1
		})
	},
	{
		name: 'Rainbow flower crown',
		itemCost: new Bank({
			Coins: 5000
		}),
		outputItems: new Bank({
			'Rainbow flower crown': 1
		})
	},
	{
		name: 'Mithril seeds',
		gpCost: 3000,
		ironmanPrice: 600,
		outputItems: new Bank({
			'Mithril seeds': 1
		})
	},
	{
		name: 'Brown apron',
		gpCost: 1000,
		ironmanPrice: 100
	},
	{
		name: 'White apron',
		gpCost: 1000,
		ironmanPrice: 100
	},
	{
		name: 'Bull roarer',
		gpCost: 1000,
		ironmanPrice: 100
	},
	{
		name: 'Rolling pin',
		gpCost: 1000,
		ironmanPrice: 100
	},
	{
		name: 'Adamant halberd',
		gpCost: 100_000,
		ironmanPrice: 9600,
		qpRequired: 150,
		skillsNeeded: soteSkillRequirements
	},
	...[
		'Pirate bandana (white)',
		'Stripy pirate shirt (white)',
		'Pirate leggings (white)',
		'Pirate bandana (blue)',
		'Stripy pirate shirt (blue)',
		'Pirate leggings (blue)',
		'Pirate bandana (brown)',
		'Stripy pirate shirt (brown)',
		'Pirate leggings (brown)',
		'Pirate bandana (red)',
		'Stripy pirate shirt (red)',
		'Pirate leggings (red)'
	].map(i => ({
		name: i,
		gpCost: 2000,
		ironmanPrice: 100
	})),
	...[
		'Ghostly boots',
		'Ghostly cloak',
		'Ghostly gloves',
		'Ghostly hood',
		'Ghostly robe top',
		'Ghostly robe bottom',
		'Shadow sword'
	].map(i => ({
		name: i,
		gpCost: 10_000,
		qpRequired: 10
	})),
	{
		name: 'Menaphite purple outfit',
		gpCost: 5000,
		ironmanPrice: 600,
		outputItems: new Bank({
			'Menaphite purple hat': 1,
			'Menaphite purple top': 1,
			'Menaphite purple robe': 1,
			'Menaphite purple kilt': 1
		})
	},
	{
		name: 'Menaphite red outfit',
		gpCost: 5000,
		ironmanPrice: 600,
		outputItems: new Bank({
			'Menaphite red hat': 1,
			'Menaphite red top': 1,
			'Menaphite red robe': 1,
			'Menaphite red kilt': 1
		})
	},
	{
		name: 'Bone club',
		gpCost: 1000
	},
	{
		name: 'Bone spear',
		gpCost: 1000
	},
	{
		name: 'Bone dagger',
		gpCost: 2500
	},
	{
		name: 'Dorgeshuun crossbow',
		gpCost: 2500
	},
	{
		name: 'Crystal bow',
		gpCost: 900_000
	},
	...sepulchreBuyables,
	...constructionBuyables,
	...hunterBuyables,
	...magicBuyables,
	...questBuyables,
	...noveltyFood,
	...fremennikClothes,
	...gnomeClothes,
	...canifisClothes,
	...castleWarsBuyables,
	...cmCapes,
	...slayerBuyables,
	...capeBuyables,
	...miningBuyables,
	...runeBuyables,
	...bsoBuyables,
	...randomEventBuyables,
	...tobCapes,
	...perduBuyables,
	...skillCapeBuyables,
	...aerialFishBuyables,
	...troubleBrewingBuyables,
	...monkeyRumbleBuyables,
	...ironmenBuyables,
	...shootingStarsBuyables
];

for (const [chompyHat, qty] of chompyHats) {
	Buyables.push({
		name: chompyHat.name,
		outputItems: new Bank().add(chompyHat.id),
		gpCost: qty * 44,
		minigameScoreReq: ['big_chompy_bird_hunting', qty]
	});
}

export const allTeamCapes: Item[] = [];
for (let i = 1; i < 51; i++) {
	allTeamCapes.push(getOSItem(`Team-${i} cape`));
}
for (const cape of allTeamCapes) {
	Buyables.push({
		name: cape.name,
		outputItems: new Bank().add(cape.id),
		gpCost: 1000
	});
}

export default Buyables;
