import { z } from 'zod';

export const ZExtraSettings = z
	.object({
		tradeEnableEmbed: z.boolean().default(false),
		tradeMaxPull: z.number().int().positive().default(70),
		tradeTimeout: z.number().int().positive().default(15),
		tradeEmbedTimeout: z.number().int().positive().default(25),
		tradeAllowAll: z.boolean().default(false),
		return_ephemeral: z.enum(['default', 'explicit']).default('default'),
		edit_reply: z.enum(['edit', 'noedit']).default('edit'),
		return_behavior: z.enum(['prefer_webhooks', 'prefer_followUps']).default('prefer_followUps')
	})
	.strict();

export type IExtraSettings = z.infer<typeof ZExtraSettings>;
