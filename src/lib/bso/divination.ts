import { Portent } from '@prisma/client';
import { Bank, LootTable } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { BitField } from '../constants';
import { prisma } from '../settings/prisma';
import { hasUnlockedAtlantis } from '../util';
import getOSItem from '../util/getOSItem';
import itemID from '../util/itemID';

export const divinationEnergies = [
	{
		level: 1,
		type: 'Pale',
		harvestXP: 1,
		convertNormal: 3,
		convertBoon: null,
		convertWithEnergy: 3.7,
		convertWithEnergyAndBoon: null,
		item: getOSItem('Pale energy'),
		boon: null,
		boonBitfield: null,
		boonEnergyCost: null
	},
	{
		level: 10,
		type: 'Flickering',
		harvestXP: 4,
		convertNormal: 8,
		convertBoon: 8.8,
		convertWithEnergy: 10,
		convertWithEnergyAndBoon: 11,
		item: getOSItem('Flickering energy'),
		boon: getOSItem('Boon of flickering energy'),
		boonBitfield: BitField.HasFlickeringBoon,
		boonEnergyCost: 100
	},
	{
		level: 20,
		type: 'Bright',
		harvestXP: 6,
		convertNormal: 10,
		convertBoon: 11,
		convertWithEnergy: 12.4,
		convertWithEnergyAndBoon: 13.6,
		item: getOSItem('Bright energy'),
		boon: getOSItem('Boon of bright energy'),
		boonBitfield: BitField.HasBrightBoon,
		boonEnergyCost: 300
	},
	{
		level: 30,
		type: 'Glowing',
		harvestXP: 8,
		convertNormal: 14,
		convertBoon: 15.4,
		convertWithEnergy: 17.4,
		convertWithEnergyAndBoon: 19.1,
		item: getOSItem('Glowing energy'),
		boon: getOSItem('Boon of glowing energy'),
		boonBitfield: BitField.HasGlowingBoon,
		boonEnergyCost: 500
	},
	{
		level: 40,
		type: 'Sparkling',
		harvestXP: 10,
		convertNormal: 24,
		convertBoon: 26.4,
		convertWithEnergy: 30,
		convertWithEnergyAndBoon: 33,
		item: getOSItem('Sparkling energy'),
		boon: getOSItem('Boon of sparkling energy'),
		boonBitfield: BitField.HasSparklingBoon,
		boonEnergyCost: 600
	},
	{
		level: 50,
		type: 'Gleaming',
		harvestXP: 12,
		convertNormal: 38,
		convertBoon: 41.8,
		convertWithEnergy: 47.4,
		convertWithEnergyAndBoon: 52.1,
		item: getOSItem('Gleaming energy'),
		boon: getOSItem('Boon of gleaming energy'),
		boonBitfield: BitField.HasGleamingBoon,
		boonEnergyCost: 800,
		clueTable: new LootTable().add('Clue scroll (beginner)', 1, 7).add('Clue scroll (easy)', 1, 6)
	},
	{
		level: 60,
		type: 'Vibrant',
		harvestXP: 14,
		convertNormal: 50,
		convertBoon: 55,
		convertWithEnergy: 62.5,
		convertWithEnergyAndBoon: 68.7,
		item: getOSItem('Vibrant energy'),
		boon: getOSItem('Boon of vibrant energy'),
		boonBitfield: BitField.HasVibrantBoon,
		boonEnergyCost: 1000,
		clueTable: new LootTable().add('Clue scroll (beginner)', 1, 7).add('Clue scroll (easy)', 1, 6)
	},
	{
		level: 70,
		type: 'Lustrous',
		harvestXP: 16,
		convertNormal: 64,
		convertBoon: 70.4,
		convertWithEnergy: 80,
		convertWithEnergyAndBoon: 88,
		item: getOSItem('Lustrous energy'),
		boon: getOSItem('Boon of lustrous energy'),
		boonBitfield: BitField.HasLustrousBoon,
		boonEnergyCost: 1250,
		clueTable: new LootTable()
			.add('Clue scroll (beginner)', 1, 7)
			.add('Clue scroll (easy)', 1, 6)
			.add('Clue scroll (medium)', 1, 5)
	},
	{
		level: 75,
		type: 'Elder',
		harvestXP: 17,
		convertNormal: 67,
		convertBoon: 73.7,
		convertWithEnergy: 83.6,
		convertWithEnergyAndBoon: 92,
		item: getOSItem('Elder energy'),
		boon: getOSItem('Boon of elder energy'),
		boonBitfield: BitField.HasElderBoon,
		boonEnergyCost: 1375,
		clueTable: new LootTable()
			.add('Clue scroll (easy)', 1, 6)
			.add('Clue scroll (medium)', 1, 5)
			.add('Clue scroll (hard)', 1, 4)
	},
	{
		level: 80,
		type: 'Brilliant',
		harvestXP: 18,
		convertNormal: 70,
		convertBoon: 77,
		convertWithEnergy: 87.4,
		convertWithEnergyAndBoon: 96.1,
		item: getOSItem('Brilliant energy'),
		boon: getOSItem('Boon of brilliant energy'),
		boonBitfield: BitField.HasBrilliantBoon,
		boonEnergyCost: 1500,
		clueTable: new LootTable()
			.add('Clue scroll (easy)', 1, 6)
			.add('Clue scroll (medium)', 1, 5)
			.add('Clue scroll (hard)', 1, 4)
			.add('Clue scroll (elite)', 1, 3)
	},
	{
		level: 85,
		type: 'Radiant',
		harvestXP: 20,
		convertNormal: 76,
		convertBoon: 83.6,
		convertWithEnergy: 95,
		convertWithEnergyAndBoon: 104.5,
		item: getOSItem('Radiant energy'),
		boon: getOSItem('Boon of radiant energy'),
		boonBitfield: BitField.HasRadiantBoon,
		boonEnergyCost: 1750,
		clueTable: new LootTable()
			.add('Clue scroll (medium)', 1, 5)
			.add('Clue scroll (hard)', 1, 4)
			.add('Clue scroll (elite)', 1, 3)
			.add('Clue scroll (master)', 1, 2)
	},
	{
		level: 90,
		type: 'Luminous',
		harvestXP: 22,
		convertNormal: 84,
		convertBoon: 92.4,
		convertWithEnergy: 105,
		convertWithEnergyAndBoon: 115.5,
		item: getOSItem('Luminous energy'),
		boon: getOSItem('Boon of luminous energy'),
		boonBitfield: BitField.HasLuminousBoon,
		boonEnergyCost: 2000,
		clueTable: new LootTable()
			.add('Clue scroll (hard)', 1, 4)
			.add('Clue scroll (elite)', 1, 3)
			.add('Clue scroll (master)', 1, 2)
			.add('Clue scroll (grandmaster)', 1, 1)
	},
	{
		level: 95,
		type: 'Incandescent',
		harvestXP: 24,
		convertNormal: 90,
		convertBoon: 99,
		convertWithEnergy: 112.4,
		convertWithEnergyAndBoon: 123.6,
		item: getOSItem('Incandescent energy'),
		boon: getOSItem('Boon of incandescent energy'),
		boonBitfield: BitField.HasIncandescentBoon,
		boonEnergyCost: 2250,
		clueTable: new LootTable()
			.add('Clue scroll (elite)', 1, 3)
			.add('Clue scroll (master)', 1, 2)
			.add('Clue scroll (grandmaster)', 1, 1)
	},
	{
		level: 110,
		type: 'Ancient',
		harvestXP: 30,
		convertNormal: 108,
		convertBoon: 118.8,
		convertWithEnergy: 134.6,
		convertWithEnergyAndBoon: 187.9,
		item: getOSItem('Ancient energy'),
		boon: getOSItem('Boon of ancient energy'),
		boonBitfield: BitField.HasAncientBoon,
		boonEnergyCost: 2250,
		clueTable: new LootTable()
			.add('Clue scroll (elite)', 1, 2)
			.add('Clue scroll (master)', 1, 2)
			.add('Clue scroll (grandmaster)', 1, 1),
		hasReq: (user: MUser) => {
			if (!hasUnlockedAtlantis(user)) {
				return 'You need to have unlocked the city of Atlantis to harvest this energy.';
			}
			return null;
		}
	}
];

for (const energy of divinationEnergies) {
	energy.boonEnergyCost = energy.level * 50;
}

export const allDivinationEnergyTypes = divinationEnergies.map(e => e.type);
export enum MemoryHarvestType {
	ConvertToXP,
	ConvertToEnergy,
	ConvertWithEnergyToXP
}
export const memoryHarvestTypes = [
	{ id: MemoryHarvestType.ConvertToXP, name: 'Convert to XP (Default)' },
	{ id: MemoryHarvestType.ConvertToEnergy, name: 'Convert to Energy' },
	{ id: MemoryHarvestType.ConvertWithEnergyToXP, name: 'Convert to XP with Energy' }
];

export enum PortentID {
	CachePortent = itemID('Cache portent'),
	GracefulPortent = itemID('Graceful portent'),
	RoguesPortent = itemID('Rogues portent'),
	DungeonPortent = itemID('Dungeon portent'),
	LuckyPortent = itemID('Lucky portent'),
	RebirthPortent = itemID('Rebirth portent'),
	MiningPortent = itemID('Mining portent'),
	LumberjackPortent = itemID('Lumberjack portent')
}
interface SourcePortent {
	id: PortentID;
	item: Item;
	divinationLevelToCreate: number;
	cost: Bank;
	chargesPerPortent: number;
	addChargeMessage: (portent: Portent) => string;
	description: string;
}

export const portents: SourcePortent[] = [
	{
		id: PortentID.CachePortent,
		item: getOSItem('Cache portent'),
		description:
			'Gives you a tradeable Guthixian cache boost item instead of instantly activating it, 1 charge per boost/item.',
		divinationLevelToCreate: 80,
		cost: new Bank().add('Lustrous energy', 500).add('Molten glass', 50),
		chargesPerPortent: 2,
		addChargeMessage: portent =>
			`You used a Cache portent, your next ${portent.charges_remaining} Guthixian cache trips will grant you a Guthixian cache boost item.`
	},
	{
		id: PortentID.GracefulPortent,
		item: getOSItem('Graceful portent'),
		description: 'Converts marks of grace into extra agility XP, one charge is used per minute.',
		divinationLevelToCreate: 80,
		cost: new Bank().add('Luminous energy', 500).add('Super energy(4)', 30),
		chargesPerPortent: 60 * 5,
		addChargeMessage: portent =>
			`You used a Graceful portent, it will turn marks of grace into extra agility XP in your next ${portent.charges_remaining} minutes of agility.`
	},
	{
		id: PortentID.RoguesPortent,
		item: getOSItem('Rogues portent'),
		description: "Give's 3x loot from pickpocketing, does not stack with thieves armband.",
		divinationLevelToCreate: 110,
		cost: new Bank().add('Ancient energy', 200).add('Elder rune', 1000),
		chargesPerPortent: 120,
		addChargeMessage: portent =>
			`You used a Rogues portent, you will receive 3x loot in your next ${portent.charges_remaining} minutes of pickpocketing.`
	},
	{
		id: PortentID.DungeonPortent,
		item: getOSItem('Dungeon portent'),
		description: 'Converts dungeoneering tokens into extra dungeoneering xp.',
		divinationLevelToCreate: 95,
		cost: new Bank().add('Brilliant energy', 512).add('Twisted bow', 1000),
		chargesPerPortent: 120,
		addChargeMessage: portent =>
			`You used a Dungeon portent, all your Dungeoneering tokens will turn into bonus XP for your next ${portent.charges_remaining} minutes of dungeoneering.`
	},
	{
		id: PortentID.LuckyPortent,
		item: getOSItem('Lucky portent'),
		description: 'Grants double loot from IC rewards and double xp from tears of guthix.',
		divinationLevelToCreate: 105,
		cost: new Bank().add('Incandescent energy', 256).add('Twisted bow', 1000),
		chargesPerPortent: 4,
		addChargeMessage: portent =>
			`You used a Lucky portent, your next ${portent.charges_remaining} Tears of Guthix or Item Contracts will grant you double the reward.`
	},
	{
		id: PortentID.RebirthPortent,
		item: getOSItem('Rebirth portent'),
		description: 'Gives you a chance to receive divine eggs from skilling, 1 charge per egg.',
		divinationLevelToCreate: 90,
		cost: new Bank().add('Brilliant energy', 512).add('Twisted bow', 1000),
		chargesPerPortent: 4,
		addChargeMessage: portent =>
			`You used a Rebirth portent, you can now receive ${portent.charges_remaining}x Divine eggs from skilling.`
	},
	{
		id: PortentID.MiningPortent,
		item: getOSItem('Mining portent'),
		description: 'Gives you a chance to receive divine eggs from skilling, 1 charge per egg.',
		divinationLevelToCreate: 90,
		cost: new Bank().add('Brilliant energy', 512).add('Twisted bow', 1000),
		chargesPerPortent: 4,
		addChargeMessage: portent =>
			`You used a Mining portent, you can now receive ${portent.charges_remaining}x Divine eggs from skilling.`
	}
];

export async function getAllPortentCharges(user: MUser) {
	const usersPortents = await prisma.portent.findMany({
		where: {
			user_id: user.id
		}
	});
	let result: Record<PortentID, number> = {};
	for (const portent of portents) {
		result[portent.id] = 0;
	}
	for (const portent of usersPortents) {
		const srcPortent = portents.find(p => p.id === portent.item_id)!;
		result[srcPortent.id] = portent.charges_remaining;
	}
	return result;
}

export async function chargePortentIfHasCharges({
	user,
	portentID,
	charges
}: {
	user: MUser;
	portentID: PortentID;
	charges: number;
}): Promise<{ didCharge: false } | { didCharge: true; portent: Portent }> {
	const portent = await prisma.portent.findFirst({
		where: {
			item_id: portentID,
			user_id: user.id
		}
	});
	if (!portent) return { didCharge: false };
	if (portent.charges_remaining < charges) return { didCharge: false };
	const newPortent = await prisma.portent.update({
		where: {
			item_id_user_id: {
				item_id: portentID,
				user_id: user.id
			}
		},
		data: {
			charges_remaining: {
				decrement: charges
			}
		}
	});
	return { didCharge: true, portent: newPortent };
}
