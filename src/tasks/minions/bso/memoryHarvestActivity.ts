import { calcPercentOfNum, increaseNumByPercent } from 'e';
import { Bank } from 'oldschooljs';

import {
	type DivinationEnergy,
	MemoryHarvestType,
	calcEnergyPerMemory,
	divinationEnergies
} from '../../../lib/bso/divination';
import { Emoji } from '../../../lib/constants';
import { inventionBoosts } from '../../../lib/invention/inventions';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { MemoryHarvestOptions } from '../../../lib/types/minions';
import { formatDuration, roll } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { userStatsBankUpdate } from '../../../mahoji/mahojiSettings';

const SECONDS_TO_HARVEST = 60;
const SECONDS_TO_CONVERT = 1;
const MEMORIES_PER_HARVEST = SECONDS_TO_HARVEST * 2;

export const totalTimePerRound = SECONDS_TO_HARVEST + SECONDS_TO_CONVERT * MEMORIES_PER_HARVEST;

function calcConversionResult(hasBoon: boolean, method: MemoryHarvestType, energy: DivinationEnergy) {
	const convertToXPXP = hasBoon ? energy.convertBoon ?? energy.convertNormal : energy.convertNormal;

	switch (method) {
		case MemoryHarvestType.ConvertToXP: {
			return { xp: convertToXPXP };
		}
		case MemoryHarvestType.ConvertToEnergy: {
			const xp = 1 + Math.ceil(convertToXPXP / 3.5);
			return { xp };
		}
		case MemoryHarvestType.ConvertWithEnergyToXP: {
			let xp: number = hasBoon
				? energy.convertWithEnergyAndBoon ?? energy.convertWithEnergy
				: energy.convertWithEnergy;
			xp = increaseNumByPercent(xp, 15);
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
	hasDivineHand,
	hasGuthixianBoost,
	isUsingDivinationPotion,
	hasMasterCape,
	rounds
}: {
	duration: number;
	energy: DivinationEnergy;
	harvestMethod: MemoryHarvestType;
	hasBoon: boolean;
	hasWispBuster: boolean;
	hasGuthixianBoost: boolean;
	hasDivineHand: boolean;
	isUsingDivinationPotion: boolean;
	hasMasterCape: boolean;
	rounds: number;
}) {
	const boosts: string[] = [];

	const petChance = (200 - energy.level) * 3714;

	const loot = new Bank();
	const cost = new Bank();
	let totalDivinationXP = 0;
	let totalMemoriesHarvested = 0;
	const energyPerMemory = calcEnergyPerMemory(energy);

	for (let i = 0; i < rounds; i++) {
		// Step 1: Harvest memories
		const memoriesHarvested = MEMORIES_PER_HARVEST;

		totalMemoriesHarvested += memoriesHarvested;

		// Step 2: Convert memories
		let { xp } = calcConversionResult(hasBoon, harvestMethod, energy);
		xp = increaseNumByPercent(xp, 40);

		totalDivinationXP += xp * memoriesHarvested;

		switch (harvestMethod) {
			case MemoryHarvestType.ConvertToXP: {
				if (roll(175)) {
					loot.add('Divine egg');
				}
				break;
			}
			case MemoryHarvestType.ConvertToEnergy: {
				if (roll(50)) {
					loot.add('Divine egg');
				}
				let energyAmount = energyPerMemory * memoriesHarvested;
				if (hasGuthixianBoost) {
					const twentyPercentRoundedUp = Math.ceil(calcPercentOfNum(20, energyAmount));
					energyAmount += twentyPercentRoundedUp;
				}
				if (hasDivineHand) {
					energyAmount = increaseNumByPercent(
						energyAmount,
						inventionBoosts.divineHand.memoryHarvestExtraYieldPercent
					);
				}
				if (isUsingDivinationPotion) {
					const threePercentRoundedUp = Math.ceil(calcPercentOfNum(3, energyAmount));
					energyAmount += threePercentRoundedUp;
				}
				if (hasMasterCape) {
					const fivePercentRoundedUp = Math.ceil(calcPercentOfNum(5, energyAmount));
					energyAmount += fivePercentRoundedUp;
				}
				loot.add(energy.item, Math.ceil(energyAmount));
				break;
			}
			case MemoryHarvestType.ConvertWithEnergyToXP: {
				cost.add(energy.item, Math.ceil(energyPerMemory * memoriesHarvested));
				break;
			}
		}

		const clueChance = 1200;
		// Step 3: Roll for pet
		for (let t = 0; t < memoriesHarvested; t++) {
			if (roll(petChance)) {
				loot.add('Doopy');
			}
			if (hasDivineHand && roll(clueChance) && 'clueTable' in energy && energy.clueTable) {
				loot.add(energy.clueTable.roll());
			}
		}
	}

	if (hasGuthixianBoost) {
		totalDivinationXP = increaseNumByPercent(totalDivinationXP, 20);
		boosts.push('20% extra XP and energy for Guthixian Cache boost');
	}

	if (hasWispBuster) {
		totalDivinationXP = increaseNumByPercent(totalDivinationXP, inventionBoosts.wispBuster.xpIncreasePercent);
		boosts.push(`${inventionBoosts.wispBuster.xpIncreasePercent}% extra XP for Wisp-buster`);
	}

	if (hasBoon) {
		boosts.push('10% extra XP for Boon');
	}

	if (hasDivineHand) {
		boosts.push(`${inventionBoosts.divineHand.memoryHarvestExtraYieldPercent}% extra energy for Divine hand`);
	}

	if (isUsingDivinationPotion) {
		totalDivinationXP = increaseNumByPercent(totalDivinationXP, 3);
		boosts.push('3% extra XP/energy for Divination potion');
	}

	if (hasMasterCape) {
		boosts.push('5% extra energy for Master cape');
	}

	return {
		cost,
		loot,
		totalDivinationXP,
		totalMemoriesHarvested,
		petChancePerMemory: petChance,
		avgPetTime: totalMemoriesHarvested / petChance / duration,
		boosts,
		energyPerMemory
	};
}

export const memoryHarvestTask: MinionTask = {
	type: 'MemoryHarvest',
	async run(data: MemoryHarvestOptions) {
		const {
			userID,
			channelID,
			duration,
			e: energyItemID,
			t: harvestMethodIndex,
			wb: hasWispBuster,
			dh: hasDivineHand,
			dp: isUsingDivinationPotion,
			r: rounds
		} = data;
		const user = await mUserFetch(userID);
		const energy = divinationEnergies.find(t => t.item.id === energyItemID)!;
		const hasBoon = energy.boonBitfield !== null ? user.bitfield.includes(energy.boonBitfield) : false;
		let didGetGuthixianBoost = false;
		if (user.user.guthixian_cache_boosts_available > 0) {
			await user.update({
				guthixian_cache_boosts_available: {
					decrement: 1
				}
			});
			didGetGuthixianBoost = true;
		}

		const { boosts, totalDivinationXP, totalMemoriesHarvested, petChancePerMemory, loot, avgPetTime, cost } =
			memoryHarvestResult({
				duration,
				hasBoon,
				energy,
				harvestMethod: harvestMethodIndex,
				hasWispBuster,
				hasGuthixianBoost: didGetGuthixianBoost,
				hasDivineHand,
				isUsingDivinationPotion,
				hasMasterCape: user.hasEquippedOrInBank('Divination master cape'),
				rounds
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
			await userStatsBankUpdate(user.id, 'divination_loot', loot);
			await user.addItemsToBank({
				items: loot,
				collectionLog: true
			});
			str += `\n${loot.has('Doopy') ? `${Emoji.Purple} ` : ''}You received: ${loot}.`;
		}

		if (boosts.length > 0) {
			str += `\n\n**Boosts:** ${boosts.join(', ')}`;
		}

		return handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
