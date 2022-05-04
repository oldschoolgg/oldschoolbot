import { FarmingPatchName } from '../../../mahoji/commands/farming';
import { Plant } from '../../skilling/types';

export interface IPatchData {
	lastPlanted: string | null;
	patchPlanted: boolean; // false -> nothing planted, true -> something planted
	plantTime: number;
	lastQuantity: number;
	lastUpgradeType: string | null;
	lastPayment: boolean;
	wasReminded?: true;
}
export interface IPatchDataDetailed extends IPatchData {
	ready: boolean | null;
	readyIn: number | null;
	readyAt: Date | null;
	patchName: FarmingPatchName;
	friendlyName: string;
	plant: Plant | null;
}

export type PatchData = IPatchData | null;

export type PlantTier = 0 | 1 | 2 | 3 | 4 | 5;

export interface FarmingContract {
	hasContract: boolean;
	difficultyLevel: 'easy' | 'medium' | 'hard' | null;
	plantToGrow: string | null;
	plantTier: PlantTier;
	contractsCompleted: number;
}
