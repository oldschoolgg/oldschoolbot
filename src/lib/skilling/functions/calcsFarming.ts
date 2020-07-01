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

export function calcYieldCrystal(plant: Plant, upgradeType: string) {
	if (!plant.variableYield) return;
	if (!plant.variableOutputAmount) return;
	let cropYield = 0;
	for (let i = plant.variableOutputAmount.length; i > 0; i--) {
		const [upgradeTypeNeeded, min, max] = plant.variableOutputAmount[i - 1];
		if (upgradeType === upgradeTypeNeeded) {
			cropYield = rand(min, max);
			break;
		}
	}
	if (!cropYield) throw `error!`;
	return cropYield;
}
