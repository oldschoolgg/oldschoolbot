import { ChannelType } from 'discord-api-types/v10';
import z from 'zod';

import { ZPermission } from './shared.js';

export const ZGuild = z.object({
	id: z.string(),
	staff_only_channels: z.array(z.string()),
	disabled_commands: z.array(z.string()),
	petchannel: z.string().nullable()
});
export type IGuild = z.infer<typeof ZGuild>;

export const ZUser = z.object({
	id: z.string(),
	username: z.string(),
	bot: z.boolean()
});
export type IUser = z.infer<typeof ZUser>;

export const ZMember = z.object({
	user_id: z.string(),
	guild_id: z.string(),
	roles: z.array(z.string()),
	permissions: ZPermission.array(),
	joined_at: z.string().nullable().optional()
});
export type IMember = z.infer<typeof ZMember>;

export const ZRole = z.object({
	id: z.string(),
	guild_id: z.string(),
	name: z.string(),
	color: z.number(),
	permissions: ZPermission.array()
});

export type IRole = z.infer<typeof ZRole>;

export const ZChannel = z.object({
	id: z.string(),
	guild_id: z.string().nullable(),
	type: z.enum(ChannelType)
});
export type IChannel = z.infer<typeof ZChannel>;

export const ZEmoji = z.object({
	id: z.string(),
	guild_id: z.string(),
	name: z.string().nullable()
});
export type IEmoji = z.infer<typeof ZEmoji>;

export const ZMessage = z.object({
	id: z.string(),
	content: z.string(),
	channel_id: z.string(),
	guild_id: z.string().nullable(),
	author_id: z.string()
});
export type IMessage = z.infer<typeof ZMessage>;

export const ZMemberWithRoles = ZMember.extend({
	roles: z.array(ZRole)
});
export type IMemberWithRoles = z.infer<typeof ZMemberWithRoles>;

export const ZWebhook = z.object({
	id: z.string(),
	channel_id: z.string(),
	token: z.string()
});
export type IWebhook = z.infer<typeof ZWebhook>;
