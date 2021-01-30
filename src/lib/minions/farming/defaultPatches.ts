import { PatchData } from './types';

/**
 * The default patch information when farming is not yet trained.
 */
const defaultPatches: PatchData = {
	lastPlanted: null,
	patchPlanted: false,
	plantTime: 0,
	lastQuantity: 0,
	lastUpgradeType: null,
	lastPayment: false
};

export default defaultPatches;
