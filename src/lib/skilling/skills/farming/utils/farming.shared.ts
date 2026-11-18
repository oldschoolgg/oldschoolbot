import { FarmingPatch } from '@/prisma/main/enums.js';

export const farmingPatchNames = Object.values(FarmingPatch);

export type FarmingPatchName = FarmingPatch;
