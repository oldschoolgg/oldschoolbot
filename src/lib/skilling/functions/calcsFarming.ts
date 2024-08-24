import { randInt } from 'e';

import { QuestID } from '../../minions/data/quests';
import type { Plant } from '../types';
import { SkillsEnum } from '../types';

export function calcNumOfPatches(plant: Plant, user: MUser, qp: number): [number] {
	let numOfPatches = plant.defaultNumOfPatches;
	const farmingLevel = user.skillLevel(SkillsEnum.Farming);
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

	if (user.user.finished_quest_ids.includes(QuestID.ChildrenOfTheSun)) {
		switch (plant.seedType) {
			case 'allotment':
				numOfPatches += 2;
				break;
			case 'herb':
			case 'flower':
				numOfPatches += 1;
				break;
		}
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
