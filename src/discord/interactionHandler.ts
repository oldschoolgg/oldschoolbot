import {
	type APIChatInputApplicationCommandInteraction,
	type APIInteraction,
	ApplicationCommandType,
	ComponentType,
	InteractionType,
	MInteraction
} from '@oldschoolgg/discord';
import type { IAutoCompleteInteraction, IButtonInteraction, IChatInputCommandInteraction } from '@oldschoolgg/schemas';
import { DiscordSnowflake } from '@sapphire/snowflake';

import { autoCompleteHandler } from '@/discord/autoCompleteHandler.js';
import { commandHandler } from '@/discord/commandHandler.js';
import type { OldSchoolBotClient } from '@/discord/OldSchoolBotClient.js';
import { DISCORD_USER_IDS_INSERTED_CACHE } from '@/lib/cache.js';
import { globalButtonInteractionHandlerWrapper } from '@/lib/util/globalInteractions.js';

export async function interactionHandler(client: OldSchoolBotClient, itx: APIInteraction) {
	const guildId = itx.guild_id ?? null;
	const user = (itx.member?.user ?? itx.user)!;
	const userId = user.id;

	if (!DISCORD_USER_IDS_INSERTED_CACHE.has(userId) && user) {
		client.upsertDiscordUser(user);
	}

	if (itx.type === InteractionType.ApplicationCommandAutocomplete) {
		const d: IAutoCompleteInteraction = {
			id: itx.id,
			token: itx.token,
			user_id: userId,
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
		const interaction = new MInteraction({ interaction: d, rawInteraction: itx, client });
		await globalButtonInteractionHandlerWrapper(itx, interaction);
		return;
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
		const interaction = new MInteraction({ interaction: d, rawInteraction: chatInputItx, client });
		await commandHandler(chatInputItx, interaction);
		return;
	}
}
