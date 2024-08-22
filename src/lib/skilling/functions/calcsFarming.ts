import { randInt } from 'e';
import { userHasMasterFarmerOutfit } from '../../../mahoji/mahojiSettings';
import { BitField } from '../../constants';
import { QuestID } from '../../minions/data/quests';
import { hasUnlockedAtlantis } from '../../util';
import type { FarmingPatchName } from '../../util/farmingHelpers';
import { type Plant, SkillsEnum } from '../types';

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
	if (user.bitfield.includes(BitField.HasScrollOfFarming)) numOfPatches += 2;
	if (userHasMasterFarmerOutfit(user)) numOfPatches += 3;

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
