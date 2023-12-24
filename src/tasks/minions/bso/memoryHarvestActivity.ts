import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { divinationEnergies, MemoryHarvestType, memoryHarvestTypes } from '../../../lib/bso/divination';
import { Emoji } from '../../../lib/constants';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { MemoryHarvestOptions } from '../../../lib/types/minions';
import { calculateAverageTimeForSuccess, formatDuration, roll } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

const SECONDS_TO_HARVEST = 60;
const MEMORIES_PER_HARVEST = SECONDS_TO_HARVEST * 2;
const SECONDS_TO_CONVERT = 1;

function calcConversionResult(hasBoon: boolean, method: MemoryHarvestType, energy: (typeof divinationEnergies)[0]) {
	switch (method) {
		case MemoryHarvestType.ConvertToXP: {
			let xp = hasBoon ? energy.convertBoon ?? energy.convertNormal : energy.convertNormal;
			return { xp };
		}
		case MemoryHarvestType.ConvertToEnergy: {
			let xp = 1;
			return { xp };
		}
		case MemoryHarvestType.ConvertWithEnergyToXP: {
			let xp = hasBoon ? energy.convertWithEnergyAndBoon ?? energy.convertWithEnergy : energy.convertWithEnergy;
			return { xp };
		}
		default: {
			throw new Error(`Unknown memory harvest method: ${method}`);
		}
	}
}

function memoryHarvestResult() {}

export const memoryHarvestTask: MinionTask = {
	type: 'MemoryHarvest',
	async run(data: MemoryHarvestOptions) {
		let { userID, channelID, duration, e: energyItemID, t: harvestMethodIndex } = data;
		const user = await mUserFetch(userID);
		const energy = divinationEnergies.find(t => t.item.id === energyItemID)!;
		const hasBoon = energy.boonBitfield !== null ? user.bitfield.includes(energy.boonBitfield) : false;
		const petChance = (200 - energy.level) * 100_000;
		const totalSeconds = Math.round(duration / Time.Second);
		const totalTimePerRound = SECONDS_TO_HARVEST + SECONDS_TO_CONVERT * MEMORIES_PER_HARVEST;
		const rounds = Math.floor(totalSeconds / totalTimePerRound);

		const harvestMethod = memoryHarvestTypes[harvestMethodIndex];

		// TODO:!! Removing energy? cost? what if they dont have? converting with energy to xp
		const loot = new Bank();
		let totalDivinationXP = 0;
		let totalMemoriesHarvested = 0;

		for (let i = 0; i < rounds; i++) {
			// Step 1: Harvest memories
			const memoriesHarvested = MEMORIES_PER_HARVEST;
			totalMemoriesHarvested += memoriesHarvested;

			// Step 2: Convert memories
			const { xp } = calcConversionResult(hasBoon, harvestMethod.id, energy);
			totalDivinationXP += xp * memoriesHarvested;

			switch (harvestMethod.id) {
				case MemoryHarvestType.ConvertToXP: {
					break;
				}
				case MemoryHarvestType.ConvertToEnergy: {
					loot.add(energy.item, memoriesHarvested);
					break;
				}
				case MemoryHarvestType.ConvertWithEnergyToXP: {
					break;
				}
			}

			// Step 3: Roll for pet
			for (let i = 0; i < memoriesHarvested; i++) {
				if (roll(petChance)) {
					loot.add('Doopy');
				}
			}
		}

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Divination,
			amount: totalDivinationXP,
			source: 'MemoryHarvest',
			duration
		});

		let str = `${user.minionName} finished harvesting ${totalMemoriesHarvested.toLocaleString()}x ${
			energy.type
		} memories, and turning them into ${
			harvestMethod.id === MemoryHarvestType.ConvertToEnergy ? 'energies' : 'XP'
		}. ${xpRes}.
		
Pet chance 1 in ${petChance.toLocaleString()}, ${formatDuration(
			calculateAverageTimeForSuccess((totalMemoriesHarvested / petChance) * 100, duration)
		)} on average to get pet`;

		if (loot.length > 0) {
			await user.addItemsToBank({
				items: loot,
				collectionLog: true
			});
			str += `\n${loot.has('Doopy') ? Emoji.Purple : ''} You received: ${loot}.`;
		}

		const boosts = [];
		if (hasBoon) {
			boosts.push('10% extra XP for Boon');
		}

		return handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
