import * as z from 'zod';

export const ZTestBotDataUpdate = z.object({
	type: z.literal('data_update'),
	data: z.strictObject({
		bot_type: z.enum(['BSO', 'OSB']),
		username: z.string(),
		avatar_url: z.string().url().optional().nullable().default(null),
		start_time: z.string().datetime()
	})
});
export type ITestBotDataUpdate = z.infer<typeof ZTestBotDataUpdate>;
export type ITestBotData = ITestBotDataUpdate['data'];

export const ZTestBotAuthenticationRequest = z.object({
	type: z.literal('auth_request'),
	data: z.strictObject({
		code: z.string()
	})
});
export type ITestBotAuthenticationRequest = z.infer<typeof ZTestBotAuthenticationRequest>;

export const ZTestBotAuthenticationResponse = z.object({
	type: z.literal('auth_response'),
	data: z.strictObject({
		success: z.boolean()
	})
});
export type ITestBotAuthenticationResponse = z.infer<typeof ZTestBotAuthenticationResponse>;

export const ZTestBotPrivateUserUpdate = z.object({
	type: z.literal('private_user_update'),
	data: z.strictObject({
		username: z.string(),
		avatar_url: z.string().url().optional().nullable().default(null),
		raw_user_data: z.any(),
		recent_trips: z.array(z.string()),
		minigame_scores: z.array(z.strictObject({ minigame: z.string(), score: z.number() })),
		skills_as_xp: z.record(z.string(), z.number()),
		skills_as_levels: z.record(z.string(), z.number())
	})
});
export type ITestBotPrivateUserUpdate = z.infer<typeof ZTestBotPrivateUserUpdate>;
export type ITestBotPrivateUser = ITestBotPrivateUserUpdate['data'];

export const ZTestBotWebsocketEvent = z.union([
	ZTestBotDataUpdate,
	ZTestBotAuthenticationResponse,
	ZTestBotAuthenticationRequest,
	ZTestBotPrivateUserUpdate,
	z.strictObject({ type: z.literal('reload') })
]);
export type ITestBotWebsocketEvent = z.infer<typeof ZTestBotWebsocketEvent>;
