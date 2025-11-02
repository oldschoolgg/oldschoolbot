import type {
	IBaseInteraction,
	IButtonInteraction,
	IChatInputCommandInteraction,
	IMember,
	IUser
} from '@oldschoolgg/schemas';
import { DiscordSnowflake } from '@sapphire/snowflake';
import {
	type APIChatInputApplicationCommandGuildInteraction,
	type APIMessageComponentGuildInteraction,
	ComponentType,
	InteractionType
} from 'discord-api-types/v10';

import { BLACKLISTED_GUILDS, BLACKLISTED_USERS } from '@/lib/blacklists.js';
import { commandHandler } from '@/lib/discord/commandHandler.js';
import { MInteraction } from '@/lib/structures/MInteraction.js';
import { globalButtonInteractionHandlerWrapper } from '@/lib/util/globalInteractions.js';

const usernameInsertedCache = new Set<string>();

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
				BLACKLISTED_USERS.has(interaction.user.id) ||
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
	{
		name: 'Username Insertion',
		run: async ({ interaction }) => {
			if (usernameInsertedCache.has(interaction.user.id)) return HandlerResponseType.DidNotRespond;
			usernameInsertedCache.add(interaction.user.id);
			await prisma.user
				.upsert({
					where: {
						id: interaction.user.id
					},
					create: {
						id: interaction.user.id,
						last_command_date: new Date(),
						username: interaction.user.username
					},
					update: {
						last_command_date: new Date(),
						username: interaction.user.username
					},
					select: {
						id: true
					}
				})
				.catch(console.error);
			return HandlerResponseType.DidNotRespond;
		}
	}
];

export async function interactionHandler(
	itx: APIChatInputApplicationCommandGuildInteraction | APIMessageComponentGuildInteraction
) {
	const userId = itx.member.user.id;
	const guildId = itx.guild_id;
	try {
		const user: IUser = {
			id: userId,
			username: itx.member.user.username,
			bot: Boolean(itx.member.user.bot)
		};
		const member: IMember | null = guildId ? await Cache.getMember(guildId, userId) : null;
		// const channel: IChannel = (guildId) ? await Cache.getGuildChannel(guildId, channelId) : await Cache.getDMChannel(userId, channelId);
		// const guild: IGuild | null = guildId ? await Cache.getGuild(guildId) : null;
		// const message: IMessage | null = rawInteraction.message;

		const baseInteraction: IBaseInteraction = {
			id: itx.id,
			token: itx.token,
			user,
			member,
			created_timestamp: DiscordSnowflake.timestampFrom(itx.id),
			guild_id: itx.guild_id,
			channel_id: itx.channel.id
		};
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
				...baseInteraction,
				kind: 'Button',
				custom_id: itx.data.custom_id,
				message: {
					id: itx.message.id,
					channel_id: itx.message.channel_id,
					guild_id: guildId ?? null,
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

		if (itx.type === InteractionType.ApplicationCommand) {
			const d: IChatInputCommandInteraction = {
				...baseInteraction,
				kind: 'ChatInputCommand',
				command_name: itx.data.name,
				command_type: itx.data.type
			};
			const interaction = new MInteraction({ interaction: d, rawInteraction: itx });
			for (const handler of interactionHandlers) {
				const result = await handler.run({ interaction });
				if (result === HandlerResponseType.Responded) return;
			}
			await commandHandler(itx, interaction);
			return;
		}
	} catch (err) {
		Logging.logError(err as Error);
	}
}
