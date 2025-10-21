import { randInt } from '@oldschoolgg/rng';

import { QuestID } from '@/lib/minions/data/quests.js';
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

	const hasChildrenOfTheSun = user.user.finished_quest_ids?.includes(QuestID.ChildrenOfTheSun) ?? false;

	switch (plant.seedType) {
		case 'allotment': {
			const varlamoreAllotmentPatches = 2;
			numOfPatches = Math.max(0, numOfPatches - varlamoreAllotmentPatches);
			if (hasChildrenOfTheSun) {
				numOfPatches += varlamoreAllotmentPatches;
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
	plant: Plant,
	upgradeType: string | null,
	farmingLevel: number,
	quantityAlive: number
) {
	if (!plant.variableYield) return 0;
	let cropYield = 0;
	if (plant.name === 'Crystal tree') {
		if (!plant.variableOutputAmount) return 0;
		for (let i = plant.variableOutputAmount.length; i > 0; i--) {
			const [upgradeTypeNeeded, min, max] = plant.variableOutputAmount[i - 1];
			if (upgradeType === upgradeTypeNeeded) {
				cropYield += randInt(min, max);
				cropYield *= quantityAlive;
				break;
			}
		}
	} else if (plant.name === 'Limpwurt' || plant.name === 'Belladonna') {
		for (let i = 0; i < quantityAlive; i++) {
			cropYield += 3 + randInt(1, Math.floor(farmingLevel / 10));
		}
	}

	if (!cropYield) return 0;
	return cropYield;
}
