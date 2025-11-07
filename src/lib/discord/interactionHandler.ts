import {
	type APIChatInputApplicationCommandInteraction,
	type APIInteraction,
	ApplicationCommandType,
	ComponentType,
	InteractionType
} from '@oldschoolgg/discord';
import type {
	IAutoCompleteInteraction,
	IButtonInteraction,
	IChatInputCommandInteraction,
	IMember
} from '@oldschoolgg/schemas';
import { DiscordSnowflake } from '@sapphire/snowflake';

import { BLACKLISTED_GUILDS, BLACKLISTED_USERS } from '@/lib/cache.js';
import { autoCompleteHandler } from '@/lib/discord/autoCompleteHandler.js';
import { commandHandler } from '@/lib/discord/commandHandler.js';
import { MInteraction } from '@/lib/discord/interaction/MInteraction.js';
import { globalButtonInteractionHandlerWrapper } from '@/lib/util/globalInteractions.js';

enum HandlerResponseType {
	Responded,
	DidNotRespond
}

interface InteractionHandler {
	name: string;
	run: (options: { interaction: MInteraction }) => Promise<HandlerResponseType>;
}

const interactionHandlers: InteractionHandler[] = [
	{
		name: 'Shutting Down Check',
		run: async ({ interaction }) => {
			if (globalClient.isShuttingDown) {
				await interaction.reply({
					content:
						'The bot is currently shutting down for maintenance/updates, please try again in a couple minutes! Thank you <3',
					ephemeral: true
				});
				return HandlerResponseType.Responded;
			}
			return HandlerResponseType.DidNotRespond;
		}
	},
	{
		name: 'Blacklist Check',
		run: async ({ interaction }) => {
			if (
				BLACKLISTED_USERS.has(interaction.userId) ||
				(interaction.guildId && BLACKLISTED_GUILDS.has(interaction.guildId))
			) {
				await interaction.reply({
					content: 'You are blacklisted.',
					ephemeral: true
				});
				return HandlerResponseType.Responded;
			}
			return HandlerResponseType.DidNotRespond;
		}
	}
];

export async function apiInteractionParse(itx: APIInteraction) {
	const guildId = itx.guild_id ?? null;
	const userId = (itx.member?.user.id ?? itx.user?.id)!;
	const member: IMember | null = guildId ? await Cache.getMember(guildId, userId) : null;

	if (itx.type === InteractionType.MessageComponent && itx.data.component_type === ComponentType.Button) {
		const d: IButtonInteraction = {
			id: itx.id,
			token: itx.token,
			user_id: userId,
			member,
			created_timestamp: DiscordSnowflake.timestampFrom(itx.id),
			guild_id: guildId,
			channel_id: itx.channel.id,
			kind: 'Button',
			custom_id: itx.data.custom_id,
			message: {
				id: itx.message.id,
				channel_id: itx.message.channel_id,
				guild_id: guildId,
				author_id: itx.message.author.id,
				content: itx.message.content
			}
		};
		return new MInteraction({ interaction: d, rawInteraction: itx });
	}

	if (itx.type === InteractionType.ApplicationCommand && itx.data.type === ApplicationCommandType.ChatInput) {
		const chatInputItx = itx as APIChatInputApplicationCommandInteraction;

		const d: IChatInputCommandInteraction = {
			id: itx.id,
			token: itx.token,
			user_id: userId,
			member,
			created_timestamp: DiscordSnowflake.timestampFrom(chatInputItx.id),
			guild_id: itx.guild_id ?? null,
			channel_id: itx.channel.id,
			kind: 'ChatInputCommand',
			command_name: itx.data.name,
			command_type: itx.data.type
		};
		return new MInteraction({ interaction: d, rawInteraction: chatInputItx });
	}

	throw new Error('Unsupported interaction type');
}

export async function interactionHandler(itx: APIInteraction) {
	const guildId = itx.guild_id ?? null;
	const userId = (itx.member?.user.id ?? itx.user?.id)!;
	const member: IMember | null = guildId ? await Cache.getMember(guildId, userId) : null;

	if (itx.type === InteractionType.ApplicationCommandAutocomplete) {
		const d: IAutoCompleteInteraction = {
			id: itx.id,
			token: itx.token,
			user_id: userId,
			member,
			created_timestamp: DiscordSnowflake.timestampFrom(itx.id),
			guild_id: guildId,
			channel_id: itx.channel?.id ?? null,
			kind: 'AutoComplete',
			command_name: itx.data.name,
			options: itx.data.options
		};
		return autoCompleteHandler(d);
	}

	// Button
	if (itx.type === InteractionType.MessageComponent && itx.data.component_type === ComponentType.Button) {
		const d: IButtonInteraction = {
			id: itx.id,
			token: itx.token,
			user_id: userId,
			member,
			created_timestamp: DiscordSnowflake.timestampFrom(itx.id),
			guild_id: guildId,
			channel_id: itx.channel.id,
			kind: 'Button',
			custom_id: itx.data.custom_id,
			message: {
				id: itx.message.id,
				channel_id: itx.message.channel_id,
				guild_id: guildId,
				author_id: itx.message.author.id,
				content: itx.message.content
			}
		};
		const interaction = new MInteraction({ interaction: d, rawInteraction: itx });
		for (const handler of interactionHandlers) {
			const result = await handler.run({ interaction });
			if (result === HandlerResponseType.Responded) return;
		}
		await globalButtonInteractionHandlerWrapper(itx, interaction);
		return;
	}

	if (itx.type === InteractionType.ApplicationCommand && itx.data.type === ApplicationCommandType.ChatInput) {
		const chatInputItx = itx as APIChatInputApplicationCommandInteraction;
		const d: IChatInputCommandInteraction = {
			id: itx.id,
			token: itx.token,
			user_id: userId,
			member,
			created_timestamp: DiscordSnowflake.timestampFrom(chatInputItx.id),
			guild_id: itx.guild_id ?? null,
			channel_id: itx.channel.id,
			kind: 'ChatInputCommand',
			command_name: itx.data.name,
			command_type: itx.data.type
		};
		const interaction = new MInteraction({ interaction: d, rawInteraction: chatInputItx });
		for (const handler of interactionHandlers) {
			const result = await handler.run({ interaction });
			if (result === HandlerResponseType.Responded) return;
		}
		await commandHandler(chatInputItx, interaction);
		return;
	}
}
