import { z } from 'zod';

export const ZWikiBucketItem = z.object({
	page_name: z.string(),
	release_date: z.string().optional(),
	examine: z.string(),
	item_id: z.array(z.string()),
	is_members_only: z.boolean().optional(),
	weight: z.number().optional(),
	item_name: z.string(),
	high_alchemy_value: z.number().optional(),
	value: z.number().optional(),
	buy_limit: z.number().optional()
});
export type IWikiBucketItem = z.infer<typeof ZWikiBucketItem>;
