import { Items } from 'oldschooljs';
import { z } from 'zod';

export const bingoThemes = ['winter', 'spring', 'summer', 'autumn', 'ironman'] as const;
export const bingoItemIDs = z
	.array(
		z
			.number()
			.int()
			.positive()
			.refine(id => Items.get(id) !== undefined)
	)
	.min(1)
	.transform(ids => [...new Set(ids)]);
const baseChallenge = z.object({
	id: z.string().regex(/^[a-z0-9_]{1,64}$/),
	name: z.string().min(1).max(80),
	description: z.string().min(1).max(300),
	iconItemID: z
		.number()
		.int()
		.positive()
		.refine(id => Items.get(id) !== undefined)
});

export const bingoChallengeSchema = z.discriminatedUnion('type', [
	baseChallenge.extend({ type: z.literal('item_drop'), targetItemIDs: bingoItemIDs }),
	baseChallenge.extend({
		type: z.literal('item_quantity'),
		targetItemIDs: bingoItemIDs,
		requiredQuantity: z.number().int().positive().max(1_000_000_000)
	}),
	baseChallenge.extend({
		type: z.literal('custom'),
		evaluator: z.literal('item_sets'),
		// Complete any one set; every group within that set needs one eligible item.
		itemSets: z.array(z.array(bingoItemIDs).min(1)).min(1)
	})
]);

export const bingoBoardSchema = z
	.array(bingoChallengeSchema)
	.length(28)
	.refine(
		challenges => new Set(challenges.map(c => c.id)).size === challenges.length,
		'Challenge IDs must be unique.'
	);

export type BingoTheme = (typeof bingoThemes)[number];
export type BingoChallenge = z.infer<typeof bingoChallengeSchema>;
