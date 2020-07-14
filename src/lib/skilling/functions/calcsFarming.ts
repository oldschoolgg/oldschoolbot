import { KlasaUser } from 'klasa';

import { Plant, SkillsEnum } from '../types';
import { rand } from 'oldschooljs/dist/util/util';

export function calcNumOfPatches(plant: Plant, user: KlasaUser, qp: number) {
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
	for (let i = plant.additionalPatchesByFarmLvl.length; i > 0; i--) {
		const [farmingLevelReq, additionalPatches] = plant.additionalPatchesByFarmLvl[i - 1];
		if (farmingLevel >= farmingLevelReq) {
			numOfPatches += additionalPatches;
			break;
		}
	}
	return numOfPatches;
}

export function calcVariableYield(plant: Plant, upgradeType: string, farmingLevel: number) {
	if (!plant.variableYield) return;
	let cropYield = 0;
	if (plant.name === 'Crystal tree') {
		if (!plant.variableOutputAmount) return;
		for (let i = plant.variableOutputAmount.length; i > 0; i--) {
			const [upgradeTypeNeeded, min, max] = plant.variableOutputAmount[i - 1];
			if (upgradeType === upgradeTypeNeeded) {
				cropYield = rand(min, max);
				break;
			}
		}
	} else if (plant.name === 'Limpwurt') {
		cropYield = 3 + rand(1, Math.floor(farmingLevel / 10));
	}

	if (!cropYield) throw `error!`;
	return cropYield;
}
