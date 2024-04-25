import { roll } from 'e';
import { Bank, LootTable } from 'oldschooljs';

import { MysteryBoxes } from '../../../bsoOpenables';
import { BitField } from '../../../constants';
import { globalDroprates } from '../../../data/globalDroprates';
import { clAdjustedDroprate } from '../../../util';
import getOSItem from '../../../util/getOSItem';
import resolveItems from '../../../util/resolveItems';
import { Plant } from '../../types';

export const zygomiteSeedMutChance = 10;
export const zygomiteMutSurvivalChance = 19;

export const zygomiteFarmingSource = [
	{
		name: 'Herbal zygomite',
		mutatedFromItems: resolveItems(['Torstol seed', 'Dwarf weed seed', 'Lantadyme seed']),
		seedItem: getOSItem('Herbal zygomite spores'),
		lootTable: new LootTable()
			.every(
				new LootTable().add('Mushroom spore').add('Mort myre fungus', [40, 100]).add('Mushroom', [20, 50]),
				5
			)
			.every(new LootTable().add('Torstol').add('Dwarf weed').add('Cadantine').add('Kwuarm'), [40, 100])
			.every(MysteryBoxes)
	},
	{
		name: 'Barky zygomite',
		mutatedFromItems: resolveItems(['Magic seed', 'Redwood tree seed']),
		seedItem: getOSItem('Barky zygomite spores'),
		lootTable: new LootTable()
			.every(
				new LootTable().add('Mushroom spore').add('Mort myre fungus', [40, 100]).add('Mushroom', [20, 50]),
				5
			)
			.every(new LootTable().add('Elder logs').add('Mahogany logs'), [50, 100])
			.every(MysteryBoxes)
	},
	{
		name: 'Fruity zygomite',
		mutatedFromItems: resolveItems(['Dragonfruit tree seed', 'Palm tree seed', 'Papaya tree seed']),
		seedItem: getOSItem('Fruity zygomite spores'),
		lootTable: new LootTable()
			.every(
				new LootTable().add('Mushroom spore').add('Mort myre fungus', [40, 100]).add('Mushroom', [20, 50]),
				5
			)
			.every(new LootTable().add('Avocado').add('Mango').add('Papaya fruit').add('Lychee'), [50, 150])
			.every(MysteryBoxes)
	},
	{
		name: 'Toxic zygomite',
		mutatedFromItems: null,
		seedItem: getOSItem('Toxic zygomite spores'),
		lootTable: null
	}
];

export const zygomitePlants: Plant[] = zygomiteFarmingSource.map(src => ({
	id: src.seedItem.id,
	level: 105,
	plantXp: 181.5,
	checkXp: 0,
	harvestXp: 927.7,
	inputItems: new Bank().add(src.seedItem.id),
	name: src.name,
	aliases: [src.name.toLowerCase()],
	petChance: 7500,
	seedType: 'mushroom' as const,
	growthTime: 240,
	numOfStages: 6,
	chance1: 0,
	chance99: 0,
	chanceOfDeath: 5,
	needsChopForHarvest: false,
	fixedOutput: true,
	fixedOutputAmount: 6,
	givesLogs: false,
	givesCrops: true,
	defaultNumOfPatches: 0,
	canPayFarmer: false,
	canCompostPatch: true,
	canCompostandPay: false,
	additionalPatchesByQP: [[1, 1]],
	additionalPatchesByFarmLvl: [],
	additionalPatchesByFarmGuildAndLvl: [],
	timePerPatchTravel: 10,
	timePerHarvest: 5,
	noArcaneHarvester: src.name === 'Toxic zygomite' ? true : undefined,
	onHarvest: async ({ loot, user, quantity, messages }) => {
		const dropRate = clAdjustedDroprate(
			user,
			'Fungo',
			globalDroprates.fungo.baseRate,
			globalDroprates.fungo.clIncrease
		);
		if (src.lootTable) {
			for (let i = 0; i < quantity; i++) {
				loot.add(src.lootTable.roll());
				if (roll(dropRate)) {
					loot.add('Fungo');
				}
			}
		}
		if (src.name === 'Toxic zygomite' && !user.bitfield.includes(BitField.HasUnlockedVenatrix)) {
			await user.update({
				bitfield: {
					push: BitField.HasUnlockedVenatrix
				}
			});
			messages.push(
				'The toxic zygomite has infected a nearby spider nest, causing them to glow green and run away. Your minion has feeling something bad happened to them.'
			);
		}
	}
}));
