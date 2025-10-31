import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import z from 'zod';

export const ZGuild = z.object({
	id: z.string(),
	name: z.string()
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
	roles: z.array(z.string())
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
	guild_id: z.string().nullable(),
	type: z.number().int().nonnegative()
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
	author_id: z.string(),
	author: ZUser,
	member: ZMember.nullable()
});
export type IMessage = z.infer<typeof ZMessage>;

export const ZBaseInteraction = z.object({
	id: z.string(),
	token: z.string(),
	user: ZUser,
	member: ZMember.nullable(),
	guild: ZGuild.nullable(),
	channel: ZChannel
});
export type IBaseInteraction = z.infer<typeof ZBaseInteraction>;

const ZAutoCompleteInteractionOption = z.union([
	// subcommand
	z.object({
		type: z.literal(ApplicationCommandOptionType.Subcommand),
		name: z.string(),
		options: z
			.array(
				z.object({
					type: z.number(),
					name: z.string(),
					value: z.unknown().optional(),
					focused: z.boolean().optional()
				})
			)
			.optional()
	}),
	// subcommand group
	z.object({
		type: z.literal(ApplicationCommandOptionType.SubcommandGroup),
		name: z.string(),
		options: z.array(
			z.object({
				type: z.literal(1),
				name: z.string(),
				options: z
					.array(
						z.object({
							type: z.number(),
							name: z.string(),
							value: z.unknown().optional(),
							focused: z.boolean().optional()
						})
					)
					.optional()
			})
		)
	}),
	// normal arg
	z.object({
		type: z.literal(ApplicationCommandOptionType.String),
		name: z.string(),
		value: z.unknown().optional(),
		focused: z.boolean().optional()
	})
]);
export type IAutoCompleteInteractionOption = z.infer<typeof ZAutoCompleteInteractionOption>;

export const ZAutoCompleteInteraction = ZBaseInteraction.extend({
	kind: z.literal('AutoComplete'),
	commandName: z.string(),
	options: z.array(ZAutoCompleteInteractionOption).default([])
});
export type IAutoCompleteInteraction = z.infer<typeof ZAutoCompleteInteraction>;

export const ZButtonInteraction = ZBaseInteraction.extend({
	kind: z.literal('Button'),
	custom_id: z.string().nullable()
});
export type IButtonInteraction = z.infer<typeof ZButtonInteraction>;

export const ZChatInputCommandInteraction = ZBaseInteraction.extend({
	kind: z.literal('ChatInputCommand'),
	commandName: z.string()
});
export type IChatInputCommandInteraction = z.infer<typeof ZChatInputCommandInteraction>;

export const ZInteraction = z.union([ZAutoCompleteInteraction, ZButtonInteraction, ZChatInputCommandInteraction]);
export type IInteraction = z.infer<typeof ZInteraction>;
