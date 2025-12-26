import { z } from 'zod';

import { PosInt } from './shared.js';

export const ActivityTaskOptionsSchema = z.object({
	userID: z.string(),
	duration: z.number(),
	id: z.number(),
	finishDate: z.number(),
	channelID: z.string()
});

const CropUpgradeType = z.enum(['compost', 'supercompost', 'ultracompost']);

const PatchData = z.object({
	lastPlanted: z.string().nullable(),
	patchPlanted: z.boolean(),
	plantTime: z.number().int().nonnegative(),
	lastQuantity: z.number().int().nonnegative(),
	lastUpgradeType: CropUpgradeType.nullable(),
	lastPayment: z.boolean(),
	wasReminded: z.boolean().optional(),
	pid: PosInt.optional()
});

export const ZFarmingData = z.strictObject({
	pid: PosInt.optional(),
	plantsName: z.string().nullable(),
	quantity: PosInt.max(5000),
	upgradeType: CropUpgradeType.nullable(),
	payment: z.boolean().optional(),
	patchType: PatchData,
	planting: z.boolean(),
	currentDate: PosInt,
	autoFarmed: z.boolean()
});
