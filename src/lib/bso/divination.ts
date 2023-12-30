import { clamp } from 'e';
import { LootTable } from 'oldschooljs';

import { BitField } from '../constants';
import getOSItem from '../util/getOSItem';

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
	}
];

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

export function energyPerMemory(divLevel: number, energy: (typeof divinationEnergies)[number]) {
	const difference = clamp(divLevel - energy.level, 0, 5);
	return difference + 1;
}
