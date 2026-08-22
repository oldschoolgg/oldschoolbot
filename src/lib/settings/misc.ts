import { isValidDiscordSnowflake } from '@oldschoolgg/util';
import * as z from 'zod';

import { ZItemBank, ZStrictItemBank } from '@/lib/structures/Bank.js';

const StaffBestowSourceKey = z
	.string()
	.refine(key => key === 'mod' || key === 'contrib' || isValidDiscordSnowflake(key), {
		message: 'Staff bestow schedule key must be "mod", "contrib", or a Discord user ID.'
	});

export const ZStaffBestowBank = z
	.object({
		hourly: ZItemBank,
		daily: ZItemBank,
		weekly: ZItemBank,
		monthly: ZItemBank
	})
	.strict();

export const ZStrictStaffBestowBank = z
	.object({
		hourly: ZStrictItemBank,
		daily: ZStrictItemBank,
		weekly: ZStrictItemBank,
		monthly: ZStrictItemBank
	})
	.strict();

export const ZStaffBestowSchedule = z.record(StaffBestowSourceKey, ZStaffBestowBank);

export const ZStrictStaffBestowSchedule = z.record(StaffBestowSourceKey, ZStrictStaffBestowBank);

export const ZExtraSettings = z
	.object({
		tradeEnableEmbed: z.boolean().default(false),
		tradeMaxPull: z.number().int().positive().default(70),
		tradeTimeout: z.number().int().positive().default(15),
		tradeEmbedTimeout: z.number().int().positive().default(25)
	})
	.strict();

export type StaffBestowBank = z.infer<typeof ZStaffBestowBank>;
export type StaffBestowSchedule = z.infer<typeof ZStaffBestowSchedule>;
export type IExtraSettings = z.infer<typeof ZExtraSettings>;
