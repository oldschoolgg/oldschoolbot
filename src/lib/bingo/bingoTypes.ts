import { Items } from 'oldschooljs';
import { z } from 'zod';

export const bingoThemes = ['winter', 'spring', 'summer', 'autumn'] as const;
// Add an activity here only after its successful reward write emits bingoActivityCompletion.
export const bingoCompletionActivities = ['Woodcutting'] as const;
const itemIDs = z
	.array(
		z
			.number()
			.int()
			.positive()
			.refine(id => Items.get(id) !== undefined)
	)
	.min(1);
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
	baseChallenge.extend({ type: z.literal('item_drop'), targetItemIDs: itemIDs }),
	baseChallenge.extend({
		type: z.literal('item_quantity'),
		targetItemIDs: itemIDs,
		requiredQuantity: z.number().int().positive().max(1_000_000_000)
	}),
	baseChallenge.extend({
		type: z.literal('activity_completion'),
		activityID: z.enum(bingoCompletionActivities),
		requiredQuantity: z.number().int().positive().max(1_000_000)
	}),
	baseChallenge.extend({
		type: z.literal('custom'),
		evaluator: z.literal('item_sets'),
		// Complete any one set; every group within that set needs one eligible item.
		itemSets: z.array(z.array(itemIDs).min(1)).min(1)
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
export type BingoProgressState = { quantity: number; items: Record<string, number> };

export function challengeTarget(challenge: BingoChallenge) {
	return 'requiredQuantity' in challenge ? challenge.requiredQuantity : 1;
}

export function challengeItemIDs(challenge: BingoChallenge): number[] {
	if ('targetItemIDs' in challenge) return challenge.targetItemIDs;
	if (challenge.type === 'custom') return challenge.itemSets.flat(2);
	return [];
}
