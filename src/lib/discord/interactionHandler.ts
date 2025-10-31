import type { Interaction } from '@oldschoolgg/discord';
import type {
	IAutoCompleteInteraction,
	IBaseInteraction,
	IButtonInteraction,
	IChatInputCommandInteraction,
	IMember,
	IUser
} from '@oldschoolgg/schemas';

import { BLACKLISTED_GUILDS, BLACKLISTED_USERS } from '@/lib/blacklists.js';
import { autoCompleteHandler } from '@/lib/discord/autoCompleteHandler.js';
import { commandHandler } from '@/lib/discord/commandHandler.js';
import type { MInteraction } from '@/lib/structures/MInteraction.js';
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

const _interactionHandlers: InteractionHandler[] = [
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

export async function interactionHandler(rawInteraction: Interaction) {
	try {
		const user: IUser = {
			id: rawInteraction.user.id,
			username: rawInteraction.user.username,
			bot: rawInteraction.user.bot
		};
		const member: IMember | null = rawInteraction.member
			? {
					user_id: rawInteraction.member.user.id,
					guild_id: rawInteraction.guild ? rawInteraction.guild.id : '',
					roles: rawInteraction.member.roles as string[]
				}
			: null;
		const channel = rawInteraction.channel
			? {
					id: rawInteraction.channel.id,
					guild_id: rawInteraction.guild ? rawInteraction.guild.id : null,
					type: rawInteraction.channel.type as number
				}
			: null;
		const guild = rawInteraction.guild
			? {
					id: rawInteraction.guild.id,
					name: rawInteraction.guild.name
				}
			: null;
		const baseInteraction: IBaseInteraction = {
			id: rawInteraction.id,
			token: rawInteraction.token,
			user,
			member,
			guild,
			channel
		};
		if (rawInteraction.isAutocomplete()) {
			const d: IAutoCompleteInteraction = {
				...baseInteraction,
				kind: 'AutoComplete',
				commandName: rawInteraction.commandName,
				options: rawInteraction.options.data.map(option => ({
					name: option.name,
					type: option.type as number,
					value: option.value
				}))
			};
			await autoCompleteHandler(d);
			return;
		}

		if (rawInteraction.isButton()) {
			const d: IButtonInteraction = {
				...baseInteraction,
				kind: 'Button',
				custom_id: rawInteraction.customId
			};
			await globalButtonInteractionHandlerWrapper(d);
			return;
		}

		if (rawInteraction.isChatInputCommand()) {
			const d: IChatInputCommandInteraction = {
				...baseInteraction,
				kind: 'ChatInputCommand',
				commandName: rawInteraction.commandName
			};
			await commandHandler(d);
			return;
		}

		// const interaction = new MInteraction({ interaction: rawInteraction });
		// for (const handler of interactionHandlers) {
		// 	const result = await handler.run({ interaction });
		// 	if (result === HandlerResponseType.Responded) return;
		// }

		// if (rawInteraction.kind === 'Button') {
		// 	await globalButtonInteractionHandlerWrapper(rawInteraction);
		// 	return;
		// }

		// if (rawInteraction.kind === 'ChatInputCommand') {
		// 	await commandHandler(rawInteraction);
		// 	return;
		// }
	} catch (err) {
		Logging.logError(err as Error);
	}
}
