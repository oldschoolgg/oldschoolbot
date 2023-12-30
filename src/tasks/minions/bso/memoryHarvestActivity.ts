import { increaseNumByPercent, Time } from 'e';
import { Bank } from 'oldschooljs';

import { divinationEnergies, energyPerMemory, MemoryHarvestType } from '../../../lib/bso/divination';
import { Emoji } from '../../../lib/constants';
import { inventionBoosts } from '../../../lib/invention/inventions';
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

export function memoryHarvestResult({
	duration,
	energy,
	harvestMethod,
	hasBoon,
	hasWispBuster,
	divinationLevel
}: {
	divinationLevel: number;
	duration: number;
	energy: (typeof divinationEnergies)[0];
	harvestMethod: MemoryHarvestType;
	hasBoon: boolean;
	hasWispBuster: boolean;
}) {
	const petChance = (200 - energy.level) * 100_000;
	const totalSeconds = Math.round(duration / Time.Second);
	const totalTimePerRound = SECONDS_TO_HARVEST + SECONDS_TO_CONVERT * MEMORIES_PER_HARVEST;
	const rounds = Math.floor(totalSeconds / totalTimePerRound);

	// TODO:!! Removing energy? cost? what if they dont have? converting with energy to xp
	const loot = new Bank();
	const cost = new Bank();
	let totalDivinationXP = 0;
	let totalMemoriesHarvested = 0;

	for (let i = 0; i < rounds; i++) {
		// Step 1: Harvest memories
		let memoriesHarvested = MEMORIES_PER_HARVEST;

		if (hasWispBuster) {
			memoriesHarvested = increaseNumByPercent(
				memoriesHarvested,
				inventionBoosts.wispBuster.memoryHarvestExtraYieldPercent
			);
		}

		totalMemoriesHarvested += memoriesHarvested;

		// Step 2: Convert memories
		const { xp } = calcConversionResult(hasBoon, harvestMethod, energy);
		totalDivinationXP += xp * memoriesHarvested;

		switch (harvestMethod) {
			case MemoryHarvestType.ConvertToXP: {
				break;
			}
			case MemoryHarvestType.ConvertToEnergy: {
				loot.add(energy.item, energyPerMemory(divinationLevel, energy));
				break;
			}
			case MemoryHarvestType.ConvertWithEnergyToXP: {
				cost.add(energy.item, memoriesHarvested * 5);
				break;
			}
		}

		let clueChance = 5000;
		// Step 3: Roll for pet
		for (let t = 0; t < memoriesHarvested; t++) {
			if (roll(petChance)) {
				loot.add('Doopy');
			}
			if (hasWispBuster && roll(clueChance) && 'clueTable' in energy && energy.clueTable) {
				loot.add(energy.clueTable.roll());
			}
		}
	}

	return {
		cost,
		loot,
		totalDivinationXP,
		totalMemoriesHarvested,
		petChancePerMemory: petChance,
		avgPetTime: calculateAverageTimeForSuccess((totalMemoriesHarvested / petChance) * 100, duration)
	};
}

export const memoryHarvestTask: MinionTask = {
	type: 'MemoryHarvest',
	async run(data: MemoryHarvestOptions) {
		let { userID, channelID, duration, e: energyItemID, t: harvestMethodIndex, h: hasWispBuster } = data;
		const user = await mUserFetch(userID);
		const energy = divinationEnergies.find(t => t.item.id === energyItemID)!;
		const hasBoon = energy.boonBitfield !== null ? user.bitfield.includes(energy.boonBitfield) : false;

		const { totalDivinationXP, totalMemoriesHarvested, petChancePerMemory, loot, avgPetTime, cost } =
			memoryHarvestResult({
				duration,
				hasBoon,
				energy,
				harvestMethod: harvestMethodIndex,
				hasWispBuster,
				divinationLevel: user.skillLevel('divination')
			});

		if (cost.length > 0) {
			if (!user.owns(cost)) {
				return handleTripFinish(
					user,
					channelID,
					`${user}, ${user.minionName} couldn't complete the trip because they didn't have the required items: ${cost}.`,
					undefined,
					data,
					loot
				);
			}
			await user.removeItemsFromBank(cost);
		}

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Divination,
			amount: totalDivinationXP,
			source: 'MemoryHarvest',
			duration
		});

		let str = `${user}, ${user.minionName} finished harvesting ${totalMemoriesHarvested.toLocaleString()}x ${
			energy.type
		} memories, and turning them into ${
			harvestMethodIndex === MemoryHarvestType.ConvertToEnergy ? 'energies' : 'XP'
		}. ${xpRes}.
		
Pet chance 1 in ${petChancePerMemory.toLocaleString()}, ${formatDuration(avgPetTime)} on average to get pet`;

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
