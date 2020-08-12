import { SlayerTask } from '../../types';

export interface SlayerInfo {
	hasTask: boolean;
	currentTask: SlayerTask | null;
	quantityTask: number | null;
	remainingQuantity: number | null;
	currentMaster: number | null;
	slayerPoints: number;
	streak: number;
	wildyStreak: number;
}

/**
 * The default SlayerInfo for the user.
 */
const defaultSlayerInfo: SlayerInfo = {
	hasTask: false,
	currentTask: null,
	quantityTask: null,
	remainingQuantity: null,
	currentMaster: null,
	slayerPoints: 0,
	streak: 0,
	wildyStreak: 0
};

export default defaultSlayerInfo;
