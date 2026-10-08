import type { IFarmingContract } from '@oldschoolgg/schemas';

import type { CropUpgradeType } from '@/prisma/main/enums.js';
import type { FarmingPatchName } from '@/lib/skilling/skills/farming/utils/farmingHelpers.js';
import type { getFarmingInfoFromUser } from '@/lib/skilling/skills/farming/utils/getFarmingInfo.js';
import type { Plant } from '@/lib/skilling/types.js';

export type { FarmingPatchName };
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

export const ContractOptions = ['easy', 'medium', 'hard', 'easier'] as const;
export type ContractOption = (typeof ContractOptions)[number];

export type DetailedFarmingContract = {
	contract: IFarmingContract;
	plant: Plant | undefined;
	matchingPlantedCrop: IPatchDataDetailed | undefined;
	farmingInfo: ReturnType<typeof getFarmingInfoFromUser>;
};

export type FarmingSeedPreference =
	| { type: 'seed'; seedID: number }
	| { type: 'highest_available' }
	| { type: 'empty' };

export type FarmingPreferredSeeds = Record<string, FarmingSeedPreference>;
