import type { Interaction } from 'discord.js';

import { globalConfig } from '@/constants.js';
import { autoCompleteHandler } from '@/discord/autoCompleteHandler.js';
import { commandHandler } from '@/discord/commandHandler.js';
import { handleButtonInteraction } from '@/discord/handleButtonInteraction.js';
import { messageCtxCommands } from '@/lib/messageCtxCommands.js';
import { MInteraction } from '@/structures/MInteraction.js';
import { BlacklistedEntityType } from '../../prisma/generated/robochimp/index.js';

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
		name: 'Only Usable in Support Server',
		run: async ({ interaction }) => {
			if (!interaction.guild || interaction.guild.id !== globalConfig.supportServerID) {
				if (interaction.isRepliable()) {
					await interaction.reply({
						content: "You can't use this bot outside the support server.",
						ephemeral: true
					});
				}
				return HandlerResponseType.Responded;
			}
			return HandlerResponseType.DidNotRespond;
		}
	},
	{
		name: 'Blacklist Check',
		run: async ({ interaction }) => {
			const blacklistCount = await roboChimpClient.blacklistedEntity.count({
				where: {
					OR: [
						{
							type: BlacklistedEntityType.user,
							id: BigInt(interaction.user.id)
						},
						interaction.guildId
							? {
								type: BlacklistedEntityType.guild,
								id: BigInt(interaction.guildId)
							}
							: null
					].filter(i => i !== null)
				}
			});
			if (blacklistCount > 0) {
				if (interaction.isRepliable()) {
					await interaction.reply({
						content: 'You are blacklisted.',
						ephemeral: true
					});
				}
				return HandlerResponseType.Responded;
			}
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

		if (rawInteraction.isModalSubmit() || rawInteraction.isAnySelectMenu()) {
			throw new Error(`Unsupported interaction type: ${rawInteraction.type}`);
		}

		const interaction = new MInteraction({ interaction: rawInteraction });
		for (const handler of interactionHandlers) {
			const result = await handler.run({ interaction });
			if (result === HandlerResponseType.Responded) return;
		}

		if (rawInteraction.isButton()) {
			await handleButtonInteraction(rawInteraction);
			return;
		}

		if (rawInteraction.isChatInputCommand()) {
			await commandHandler(rawInteraction);
			return;
		}

		if (rawInteraction.isMessageContextMenuCommand()) {
			const command = messageCtxCommands.find(c => c.name === rawInteraction.commandName);
			if (!command) {
				console.error(`Unknown message context menu command: ${rawInteraction.commandName}`);
				return;
			}
			const message = await rawInteraction.channel?.messages
				.fetch(rawInteraction.targetId)
				.catch(() => undefined);
			return command.run({ interaction: rawInteraction, message, user: await globalClient.fetchUser(rawInteraction.user.id) });
		}
	} catch (err) {
		console.error(err);
	}
}
