import { masterFarmerOutfit } from '@/lib/bso/bsoConstants.js';
import { hasUnlockedAtlantis } from '@/lib/bso/bsoUtil.js';

import { BitField } from '@/lib/constants.js';
import { QuestID } from '@/lib/minions/data/quests.js';
import type { FarmingPatchName } from '@/lib/skilling/skills/farming/utils/farmingHelpers.js';
import type { Plant } from '@/lib/skilling/types.js';

export function calcNumOfPatches(plant: Plant, user: MUser, qp: number): [number] {
	let numOfPatches = plant.defaultNumOfPatches;
	const farmingLevel = user.skillsAsLevels.farming;
	const questPoints = qp;
	for (let i = plant.additionalPatchesByQP.length; i > 0; i--) {
		const [questPointsReq, additionalPatches] = plant.additionalPatchesByQP[i - 1];
		if (questPoints >= questPointsReq) {
			numOfPatches += additionalPatches;
			break;
		}
	}
	for (let i = plant.additionalPatchesByFarmGuildAndLvl.length; i > 0; i--) {
		const [farmingLevelReq, additionalPatches] = plant.additionalPatchesByFarmGuildAndLvl[i - 1];
		if (farmingLevel >= farmingLevelReq) {
			numOfPatches += additionalPatches;
			break;
		}
	}
	for (let i = plant.additionalPatchesByFarmLvl.length; i > 0; i--) {
		const [farmingLevelReq, additionalPatches] = plant.additionalPatchesByFarmLvl[i - 1];
		if (farmingLevel >= farmingLevelReq) {
			numOfPatches += additionalPatches;
			break;
		}
	}
	if (user.bitfield.includes(BitField.HasScrollOfFarming)) numOfPatches += 2;
	if (user.hasEquippedOrInBank(masterFarmerOutfit)) numOfPatches += 3;

	// Unlock extra patches in Atlantis
	const atlantisPatches: Partial<Record<FarmingPatchName, number>> = {
		fruit_tree: 1,
		seaweed: 2,
		tree: 1
	};
	if (hasUnlockedAtlantis(user)) {
		const extraAtlantisPatches = atlantisPatches[plant.seedType];
		if (extraAtlantisPatches) {
			numOfPatches += extraAtlantisPatches;
		}
	}

	const hasChildrenOfTheSun = user.user.finished_quest_ids?.includes(QuestID.ChildrenOfTheSun) ?? false;

	switch (plant.seedType) {
		case 'allotment': {
			if (hasChildrenOfTheSun) {
				numOfPatches += 2;
			}
			break;
		}
		case 'flower':
		case 'herb':
		case 'tree':
		case 'fruit_tree':
		case 'hardwood':
		case 'belladonna':
		case 'calquat':
			if (hasChildrenOfTheSun) {
				numOfPatches += 1;
			}
			break;
		default:
			break;
	}

	return [numOfPatches];
}

export function calcVariableYield(
	rng: RNGProvider,
	plant: Plant,
	upgradeType: string | null,
	farmingLevel: number,
	quantityAlive: number
) {
	if (!plant.variableYield) return 0;
	let cropYield = 0;
	if (plant.name === 'Crystal tree' || plant.name === 'Grand crystal tree') {
		if (!plant.variableOutputAmount) return 0;
		for (const [upgradeTypeNeeded, min, max] of plant.variableOutputAmount) {
			if (upgradeType === upgradeTypeNeeded) {
				for (let i = 0; i < quantityAlive; i++) {
					cropYield += rng.randInt(min, max);
				}
				break;
			}
		}
	} else if (plant.name === 'Limpwurt' || plant.name === 'Belladonna') {
		for (let i = 0; i < quantityAlive; i++) {
			cropYield += 3 + rng.randInt(1, Math.floor(farmingLevel / 10));
		}
	}

	if (!cropYield) return 0;
	return cropYield;
}
