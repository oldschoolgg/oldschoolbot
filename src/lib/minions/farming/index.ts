import * as PatchTypes from './types';

export { PatchTypes };

export const defaultPatches: PatchTypes.IPatchData = {
	lastPlanted: null,
	patchPlanted: false,
	plantTime: 0,
	lastQuantity: 0,
	lastUpgradeType: null,
	lastPayment: false
};

export const defaultFarmingContract: PatchTypes.FarmingContract = {
	hasContract: false,
	difficultyLevel: null,
	plantToGrow: null,
	plantTier: 0,
	contractsCompleted: 0
};
