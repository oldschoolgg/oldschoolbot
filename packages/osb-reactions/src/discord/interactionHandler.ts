import {
	type APIChatInputApplicationCommandInteraction,
	type APIInteraction,
	ApplicationCommandType,
	type DiscordClient,
	InteractionType,
	MInteraction
} from '@oldschoolgg/discord';
import type { IChatInputCommandInteraction } from '@oldschoolgg/schemas';
import { DiscordSnowflake } from '@sapphire/snowflake';

import { commandHandler } from '@/discord/commandHandler.js';

export async function interactionHandler(client: DiscordClient, itx: APIInteraction) {
	const userId = (itx.member?.user.id ?? itx.user?.id)!;

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
	}
}
