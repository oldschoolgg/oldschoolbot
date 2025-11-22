import type { IButtonInteraction, IChatInputCommandInteraction } from '@oldschoolgg/schemas';
import { DiscordSnowflake } from '@sapphire/snowflake';
import {
	type APIChatInputApplicationCommandInteraction,
	type APIInteraction,
	ApplicationCommandType,
	ComponentType,
	InteractionType
} from 'discord-api-types/v10';

import type { DiscordClient } from '../client/DiscordClient.js';
import { MInteraction } from './MInteraction.js';

export async function apiInteractionParse(client: DiscordClient, itx: APIInteraction) {
	const guildId = itx.guild_id ?? null;
	const userId = (itx.member?.user.id ?? itx.user?.id)!;
	// const member: IMember | null = guildId ? await Cache.getMember(guildId, userId) : null;

	if (itx.type === InteractionType.MessageComponent && itx.data.component_type === ComponentType.Button) {
		const d: IButtonInteraction = {
			id: itx.id,
			token: itx.token,
			user_id: userId,
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
		return new MInteraction({ interaction: d, rawInteraction: itx, client });
	}

	if (itx.type === InteractionType.ApplicationCommand && itx.data.type === ApplicationCommandType.ChatInput) {
		const chatInputItx = itx as APIChatInputApplicationCommandInteraction;

		const d: IChatInputCommandInteraction = {
			id: itx.id,
			token: itx.token,
			user_id: userId,
			created_timestamp: DiscordSnowflake.timestampFrom(chatInputItx.id),
			guild_id: itx.guild_id ?? null,
			channel_id: itx.channel.id,
			kind: 'ChatInputCommand',
			command_name: itx.data.name,
			command_type: itx.data.type
		};
		return new MInteraction({ interaction: d, rawInteraction: chatInputItx, client });
	}
}
