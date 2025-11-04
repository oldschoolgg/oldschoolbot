import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import z from 'zod';

import { ZMember, ZMessage } from './discord.js';
import { ZSnowflake } from './shared.js';

export const ZBaseInteraction = z.object({
	id: z.string(),
	token: z.string(),
	user_id: ZSnowflake,
	channel_id: ZSnowflake,
	created_timestamp: z.number(),
	member: ZMember.nullable(),
	guild_id: ZSnowflake.nullable()
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
	z.object({
		type: z.literal(ApplicationCommandOptionType.String),
		name: z.string(),
		value: z.unknown().optional(),
		focused: z.boolean().optional()
	}),
	z.object({
		type: z.literal(ApplicationCommandOptionType.Attachment),
		name: z.string(),
		value: z.unknown().optional(),
		focused: z.boolean().optional()
	}),
	z.object({
		type: z.literal(ApplicationCommandOptionType.Boolean),
		name: z.string(),
		value: z.unknown().optional(),
		focused: z.boolean().optional()
	}),
	z.object({
		type: z.literal(ApplicationCommandOptionType.Integer),
		name: z.string(),
		value: z.unknown().optional(),
		focused: z.boolean().optional()
	}),
	z.object({
		type: z.literal(ApplicationCommandOptionType.User),
		name: z.string(),
		value: z.unknown().optional(),
		focused: z.boolean().optional()
	}),
	z.object({
		type: z.literal(ApplicationCommandOptionType.Channel),
		name: z.string(),
		value: z.unknown().optional(),
		focused: z.boolean().optional()
	}),
	z.object({
		type: z.literal(ApplicationCommandOptionType.Role),
		name: z.string(),
		value: z.unknown().optional(),
		focused: z.boolean().optional()
	}),
	z.object({
		type: z.literal(ApplicationCommandOptionType.Mentionable),
		name: z.string(),
		value: z.unknown().optional(),
		focused: z.boolean().optional()
	}),
	z.object({
		type: z.literal(ApplicationCommandOptionType.Number),
		name: z.string(),
		value: z.unknown().optional(),
		focused: z.boolean().optional()
	})
]);
export type IAutoCompleteInteractionOption = z.infer<typeof ZAutoCompleteInteractionOption>;

export const ZAutoCompleteInteraction = ZBaseInteraction.omit({ channel_id: true }).extend({
	kind: z.literal('AutoComplete'),
	command_name: z.string(),
	channel_id: ZSnowflake.nullable(),
	options: z.array(ZAutoCompleteInteractionOption).default([])
});
export type IAutoCompleteInteraction = z.infer<typeof ZAutoCompleteInteraction>;

export const ZButtonInteraction = ZBaseInteraction.extend({
	kind: z.literal('Button'),
	custom_id: z.string().nullable(),
	message: ZMessage
});
export type IButtonInteraction = z.infer<typeof ZButtonInteraction>;

export const ZChatInputCommandInteraction = ZBaseInteraction.extend({
	kind: z.literal('ChatInputCommand'),
	command_type: z.enum(ApplicationCommandType),
	command_name: z.string()
});
export type IChatInputCommandInteraction = z.infer<typeof ZChatInputCommandInteraction>;

export const ZInteraction = z.union([ZAutoCompleteInteraction, ZButtonInteraction, ZChatInputCommandInteraction]);
export type IInteraction = z.infer<typeof ZInteraction>;
