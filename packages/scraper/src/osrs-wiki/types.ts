import { z } from 'zod';

const ZBucketItem = z.object({
	pageName: z.string(),
	releaseDate: z.string().optional(),
	examine: z.string(),
	itemId: z.array(z.number()),
	isMembersOnly: z.boolean(),
	weight: z.number(),
	itemName: z.string(),
	highAlchemyValue: z.number().optional(),
	value: z.number(),
	buyLimit: z.number().optional()
});
export type IBucketItem = z.infer<typeof ZBucketItem>;

const ZBucketItemRaw = z.object({
	page_name: z.string(),
	release_date: z.string().optional(),
	examine: z.string(),
	item_id: z.array(z.string()),
	is_members_only: z.boolean(),
	weight: z.number(),
	item_name: z.string(),
	high_alchemy_value: z.number().optional(),
	value: z.number(),
	buy_limit: z.number().optional()
});

export type IBucketItemRaw = z.infer<typeof ZBucketItemRaw>;
