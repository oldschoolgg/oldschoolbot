import { FarmingContract } from './types';

/**
 * The default farming contract information when a farming contract has never been active.
 */
const defaultFarmingContract: FarmingContract = {
	hasContract: false,
	difficultyLevel: null,
	plantToGrow: null,
	plantTier: 0,
	contractsCompleted: 0
};

export default defaultFarmingContract;
