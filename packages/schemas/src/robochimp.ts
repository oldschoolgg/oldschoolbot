import z from 'zod';

import { ZBigInt } from './shared.js';

const ZNullableBigInt = ZBigInt.nullable();

export const ZRoboChimpUser = z.object({
	id: ZBigInt,
	bits: z.array(z.number().int()),
	github_id: z.number().int().nullable(),
	patreon_id: z.string().nullable(),
	cyr_patreon_id: z.string().nullable(),
	migrated_user_id: ZNullableBigInt,
	leagues_completed_tasks_ids: z.array(z.number().int()),
	leagues_points_balance_osb: z.number().int(),
	leagues_points_balance_bso: z.number().int(),
	leagues_points_total: z.number().int(),
	react_emoji_id: z.string().nullable(),
	osb_total_level: z.number().int().nullable(),
	bso_total_level: z.number().int().nullable(),
	osb_total_xp: ZNullableBigInt,
	bso_total_xp: ZNullableBigInt,
	osb_cl_percent: z.number().nullable(),
	bso_cl_percent: z.number().nullable(),
	osb_mastery: z.number().nullable(),
	bso_mastery: z.number().nullable(),
	store_bitfield: z.array(z.number().int()),
	testing_points: z.number(),
	testing_points_balance: z.number(),
	perk_tier: z.number().int(),
	premium_balance_tier: z.number().int().nullable(),
	premium_balance_expiry_date: ZNullableBigInt,
	last_patreon_gift: ZNullableBigInt,
	user_group_id: z.string().nullable()
});
export type IRoboChimpUser = z.infer<typeof ZRoboChimpUser>;
