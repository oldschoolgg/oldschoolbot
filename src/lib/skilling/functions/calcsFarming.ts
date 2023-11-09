import { randInt } from 'e';

import { userHasMasterFarmerOutfit } from '../../../mahoji/mahojiSettings';
import { BitField } from '../../constants';
import { doaCL } from '../../data/CollectionsExport';
import { Favours, gotFavour } from '../../minions/data/kourendFavour';
import { FarmingPatchName } from '../../util/farmingHelpers';
import { Plant, SkillsEnum } from '../types';

export function calcNumOfPatches(plant: Plant, user: MUser, qp: number): [number, string | undefined] {
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
	let errorMessage: string | undefined = undefined;
	for (let i = plant.additionalPatchesByFarmGuildAndLvl.length; i > 0; i--) {
		const [hasFavour, requiredPoints] = gotFavour(user, Favours.Hosidius, 60);
		if (!hasFavour) {
			errorMessage = `${user.minionName} needs ${requiredPoints}% Hosidius Favour to use Farming guild patches.`;
			break;
		}
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
	if (userHasMasterFarmerOutfit(user)) numOfPatches += 3;

	// Unlock extra patches in Atlantis
	const atlantisPatches: Partial<Record<FarmingPatchName, number>> = {
		fruit_tree: 1,
		seaweed: 2,
		tree: 1
	};
	if (doaCL.some(itemID => user.cl.has(itemID))) {
		const extraAtlantisPatches = atlantisPatches[plant.seedType];
		if (extraAtlantisPatches) {
			numOfPatches += extraAtlantisPatches;
		}
	}

	return [numOfPatches, errorMessage];
}

export function calcVariableYield(
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
					cropYield += randInt(min, max);
				}
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
