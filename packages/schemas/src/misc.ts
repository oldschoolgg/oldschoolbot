import z from 'zod';

/**
 * Farming Contracts
 */
export const ZPlantTier = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);
export type IPlantTier = z.infer<typeof ZPlantTier>;

export const ZFarmingContractDifficultyLevel = z.union([z.literal('easy'), z.literal('medium'), z.literal('hard')]);
export type IFarmingContractDifficultyLevel = z.infer<typeof ZFarmingContractDifficultyLevel>;

export const ZFarmingContract = z.strictObject({
	hasContract: z.boolean(),
	difficultyLevel: z.union([z.literal('easy'), z.literal('medium'), z.literal('hard')]).nullable(),
	plantToGrow: z.string().nullable(),
	plantTier: ZPlantTier,
	contractsCompleted: z.number().int().min(0)
});
export type IFarmingContract = z.infer<typeof ZFarmingContract>;

/**
 * Birdhouses
 */
export const ZBirdhouseData = z.strictObject({
	lastPlaced: z.string().nullable(),
	birdhousePlaced: z.boolean(),
	birdhouseTime: z.number().int().min(0)
});
export type IBirdhouseData = z.infer<typeof ZBirdhouseData>;
