import type { IFarmingContract } from '@oldschoolgg/schemas';

import type { IPatchData } from '@/lib/skilling/skills/farming/utils/types.js';

export const defaultPatches: IPatchData = {
	lastPlanted: null,
	patchPlanted: false,
	plantTime: 0,
	lastQuantity: 0,
	lastUpgradeType: null,
	lastPayment: false
};

export const defaultFarmingContract: IFarmingContract = {
	hasContract: false,
	difficultyLevel: null,
	plantToGrow: null,
	plantTier: 0,
	contractsCompleted: 0
};
