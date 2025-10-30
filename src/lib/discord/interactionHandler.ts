import type { Interaction } from '@oldschoolgg/discord.js';

import { BLACKLISTED_GUILDS, BLACKLISTED_USERS } from '@/lib/blacklists.js';
import { autoCompleteHandler } from '@/lib/discord/autoCompleteHandler.js';
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

export async function interactionHandler(rawInteraction: Interaction) {
	try {
		if (rawInteraction.isAutocomplete()) {
			await autoCompleteHandler(rawInteraction);
			return;
		}

		if (rawInteraction.isModalSubmit() || rawInteraction.isContextMenuCommand() || rawInteraction.isSelectMenu()) {
			throw new Error(`Unsupported interaction type: ${rawInteraction.type}`);
		}

		const interaction = new MInteraction({ interaction: rawInteraction });
		for (const handler of interactionHandlers) {
			const result = await handler.run({ interaction });
			if (result === HandlerResponseType.Responded) return;
		}

		if (rawInteraction.isButton()) {
			await globalButtonInteractionHandlerWrapper(rawInteraction);
			return;
		}

		if (rawInteraction.isChatInputCommand()) {
			await commandHandler(rawInteraction);
			return;
		}
	} catch (err) {
		Logging.logError(err as Error);
	}
}
