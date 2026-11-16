import { z } from 'zod';

export const ZExtraSettings = z
	.object({
		tradeEnableEmbed: z.boolean().default(false),
		tradeMaxPull: z.number().int().positive().default(70),
		tradeTimeout: z.number().int().positive().default(15),
		tradeEmbedTimeout: z.number().int().positive().default(25),
		tradeAllowAll: z.boolean().default(false)
	})
	.strict();

export type IExtraSettings = z.infer<typeof ZExtraSettings>;
