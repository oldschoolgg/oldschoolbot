import * as PatchTypes from './types';

export { PatchTypes };

export const defaultFarmingContract: PatchTypes.FarmingContract = {
	hasContract: false,
	difficultyLevel: null,
	plantToGrow: null,
	plantTier: 0,
	contractsCompleted: 0
};
