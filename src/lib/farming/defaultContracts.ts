import { FarmingContracts } from './types';

/**
 * The default farming contract information when a farming contract has never been active.
 */
const defaultFarmingContracts: FarmingContracts = {
	contractStatus: false,
	contractType: null,
	plantToGrow: null,
	plantTier: 0,
	seedPackTier: 0,
	contractsCompleted: 0
};

export default defaultFarmingContracts;
