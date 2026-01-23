import z from 'zod';

export const ZBaseUserLog = z.strictObject({
	channel_id: z.string().optional().nullable(),
	guild_id: z.string().optional().nullable(),
	message_id: z.string().optional().nullable()
});
export type IBaseUserLog = z.infer<typeof ZBaseUserLog>;

export const ZUserLog = z.union([
	ZBaseUserLog.extend({
		type: z.literal('CLICK_BUTTON'),
		button_id: z.string().nullable()
	}),
	ZBaseUserLog.extend({
		type: z.literal('CANCEL_TRIP'),
		activity_id: z.number()
	})
]);

export type IUserLog = z.infer<typeof ZUserLog>;
