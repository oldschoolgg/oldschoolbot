import { PatchData } from './types';

/**
 * The default patch information when farming is not yet trained.
 */
const defaultPatches: PatchData = {
	lastPlanted: '',
	patchStage: false,
	plantTime: 0,
	lastQuantity: 0,
	lastUpgradeType: '',
	lastPayment: false
};

export default defaultPatches;
