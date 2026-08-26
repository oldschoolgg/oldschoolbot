import { isValidDiscordSnowflake } from '@oldschoolgg/util';
import * as z from 'zod';

import { BitField } from '@/lib/constants.js';
import { ZItemBank } from '@/lib/structures/Bank.js';

export const StaffGrantRoleSources = {
	mod: BitField.Moderator,
	contrib: BitField.Contributor,
	wiki: BitField.WikiContributor
} as const;

const StaffGrantRoleSourceKeys = new Set(Object.keys(StaffGrantRoleSources));

const StaffBestowSourceKey = z
	.string()
	.refine(key => StaffGrantRoleSourceKeys.has(key) || isValidDiscordSnowflake(key), {
		message: 'Staff bestow schedule key must be "wiki", "mod", "contrib", or a Discord user ID.'
	});

export const ZStaffGrants = z
	.object({
		hourly: z.record(StaffBestowSourceKey, ZItemBank).optional(),
		daily: z.record(StaffBestowSourceKey, ZItemBank).optional(),
		weekly: z.record(StaffBestowSourceKey, ZItemBank).optional(),
		monthly: z.record(StaffBestowSourceKey, ZItemBank).optional()
	})
	.strict();

export const ZExtraSettings = z
	.object({
		tradeEnableEmbed: z.boolean().default(false),
		tradeMaxPull: z.number().int().positive().default(70),
		tradeTimeout: z.number().int().positive().default(15),
		tradeEmbedTimeout: z.number().int().positive().default(25)
	})
	.strict();

export type StaffGrants = z.infer<typeof ZStaffGrants>;
export type IExtraSettings = z.infer<typeof ZExtraSettings>;
