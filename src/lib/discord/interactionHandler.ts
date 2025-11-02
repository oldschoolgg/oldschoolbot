import type {
	IButtonInteraction,
	IChatInputCommandInteraction,
	IMember,
} from '@oldschoolgg/schemas';
import { DiscordSnowflake } from '@sapphire/snowflake';
import {
	type APIChatInputApplicationCommandInteraction,
	type APIInteraction,
	ApplicationCommandType,
	ComponentType,
	InteractionType
} from 'discord-api-types/v10';

import { BLACKLISTED_GUILDS, BLACKLISTED_USERS } from '@/lib/blacklists.js';
import { commandHandler } from '@/lib/discord/commandHandler.js';
import { MInteraction } from '@/lib/discord/interaction/MInteraction.js';
import { globalButtonInteractionHandlerWrapper } from '@/lib/util/globalInteractions.js';

// const usernameInsertedCache = new Set<string>();

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
	},
	// TODO:
	// {
	// 	name: 'Username Insertion',
	// 	run: async ({ interaction }) => {
	// 		if (usernameInsertedCache.has(interaction.userId)) return HandlerResponseType.DidNotRespond;
	// 		usernameInsertedCache.add(interaction.userId);
	// 		await prisma.user
	// 			.upsert({
	// 				where: {
	// 					id: interaction.userId
	// 				},
	// 				create: {
	// 					id: interaction.userId,
	// 					last_command_date: new Date(),
	// 					username: interaction.user.username
	// 				},
	// 				update: {
	// 					last_command_date: new Date(),
	// 					username: interaction.user.username
	// 				},
	// 				select: {
	// 					id: true
	// 				}
	// 			})
	// 			.catch(console.error);
	// 		return HandlerResponseType.DidNotRespond;
	// 	}
	// }
];

export async function apiInteractionParse(
	itx: APIInteraction
) {
	const guildId = itx.guild_id ?? null;
	const userId = itx.member?.user.id ?? itx.user?.id!;
	const member: IMember | null = guildId ? await Cache.getMember(guildId, userId) : null;
	const user = await globalClient.fetchUser(userId);

	if (itx.type === InteractionType.MessageComponent && itx.data.component_type === ComponentType.Button) {
		const d: IButtonInteraction = {
			id: itx.id,
			token: itx.token,
			user,
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
				content: itx.message.content,
				author: user!,
				member
			}
		};
		return new MInteraction({ interaction: d, rawInteraction: itx });
	}

	if (itx.type === InteractionType.ApplicationCommand && itx.data.type === ApplicationCommandType.ChatInput) {
		// TODO?
		const chatInputItx = itx as APIChatInputApplicationCommandInteraction;
		const d: IChatInputCommandInteraction = {
			id: itx.id,
			token: itx.token,
			user,
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


export async function interactionHandler(
	itx: APIInteraction
) {
	const guildId = itx.guild_id ?? null;
	const userId = itx.member?.user.id ?? itx.user?.id!;
	const member: IMember | null = guildId ? await Cache.getMember(guildId, userId) : null;
	const user = await globalClient.fetchUser(userId);
	// const channel: IChannel = (guildId) ? await Cache.getGuildChannel(guildId, channelId) : await Cache.getDMChannel(userId, channelId);
	// const guild: IGuild | null = guildId ? await Cache.getGuild(guildId) : null;
	// const message: IMessage | null = rawInteraction.message;
	// if (rawInteraction.isAutocomplete()) {
	// 	const d: IAutoCompleteInteraction = {
	// 		...baseInteraction,
	// 		kind: 'AutoComplete',
	// 		commandName: rawInteraction.commandName,
	// 		options: rawInteraction.options.data.map(option => ({
	// 			name: option.name,
	// 			type: option.type as number,
	// 			value: option.value
	// 		}))
	// 	};
	// 	await autoCompleteHandler(d);
	// 	return;
	// }

	// Button
	if (itx.type === InteractionType.MessageComponent && itx.data.component_type === ComponentType.Button) {
		const d: IButtonInteraction = {
			id: itx.id,
			token: itx.token,
			user,
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
				content: itx.message.content,
				author: user!,
				member
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
		// TODO?
		const chatInputItx = itx as APIChatInputApplicationCommandInteraction;
		const d: IChatInputCommandInteraction = {
			id: itx.id,
			token: itx.token,
			user,
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
