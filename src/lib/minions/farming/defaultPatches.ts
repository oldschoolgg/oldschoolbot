import { IPatchData } from './types';

/**
 * The default patch information when farming is not yet trained.
 */
const defaultPatches: IPatchData = {
	lastPlanted: null,
	patchPlanted: false,
	plantTime: 0,
	lastQuantity: 0,
	lastUpgradeType: null,
	lastPayment: false
};

export default defaultPatches;
