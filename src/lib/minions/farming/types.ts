import type { CropUpgradeType } from '@prisma/client';

import type { Plant } from '../../skilling/types';
import type { FarmingPatchName } from '../../util/farmingHelpers';

export interface IPatchData {
	lastPlanted: string | null;
	patchPlanted: boolean; // false -> nothing planted, true -> something planted
	plantTime: number;
	lastQuantity: number;
	lastUpgradeType: CropUpgradeType | null;
	lastPayment: boolean;
	wasReminded?: true;
	pid?: number;
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
export type FarmingContractDifficultyLevel = 'easy' | 'medium' | 'hard';

export interface FarmingContract {
	hasContract: boolean;
	difficultyLevel: FarmingContractDifficultyLevel | null;
	plantToGrow: string | null;
	plantTier: PlantTier;
	contractsCompleted: number;
}

export const ContractOptions = ['easy', 'medium', 'hard', 'easier'] as const;
export type ContractOption = (typeof ContractOptions)[number];
