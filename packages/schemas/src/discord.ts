import z from 'zod';

export const ZGuild = z.object({
	id: z.string(),
	name: z.string(),
	icon: z.string().nullable(),
	owner_id: z.string()
});
export type IGuild = z.infer<typeof ZGuild>;

export const ZUser = z.object({
	id: z.string(),
	username: z.string(),
	bot: z.boolean()
});
export type IUser = z.infer<typeof ZUser>;

export const ZMember = z.object({
	id: z.string(),
	guild_id: z.string(),
	nick: z.string().nullable(),
	roles: z.array(z.string()),
	joined_at: z.string()
});
export type IMember = z.infer<typeof ZMember>;

export const ZRole = z.object({
	id: z.string(),
	guild_id: z.string(),
	name: z.string(),
	color: z.number(),
	permissions: z.string()
});
export type IRole = z.infer<typeof ZRole>;

export const ZChannel = z.object({
	id: z.string(),
	guild_id: z.string(),
	name: z.string(),
	type: z.number().int().nonnegative()
});
export type IChannel = z.infer<typeof ZChannel>;

export const ZEmoji = z.object({
	id: z.string(),
	guild_id: z.string(),
	name: z.string().nullable()
});
export type IEmoji = z.infer<typeof ZEmoji>;
