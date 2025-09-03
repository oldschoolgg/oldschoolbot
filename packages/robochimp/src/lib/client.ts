import { isObject } from '@oldschoolgg/toolkit';
import { MahojiClient, convertCommandToAPICommand } from '@oldschoolgg/toolkit/discord-util';
import { ApplicationCommandType, Client, Routes } from 'discord.js';

import { blacklistCommand } from '../commands/blacklist.js';
import { linkCommand } from '../commands/link.js';
import { pingableRolesCommand } from '../commands/pingableroles.js';
import { reactCommand } from '../commands/react.js';
import { tagCommand } from '../commands/tag.js';
import { toolsCommand } from '../commands/tools.js';
import { triviaCommand } from '../commands/trivia.js';
import { TEST_SERVER_ID, globalConfig } from '../constants.js';
import { handleMessageCreate } from '../events/messageCreate.js';
import { handleInteraction } from '../interactionHandler.js';
import { messageCtxCommands } from './messageCtxCommands.js';

declare global {
	var djsClient: Client<boolean>;
}

global.djsClient = new Client({
	intents: ['GuildMessages', 'Guilds', 'GuildMembers', 'MessageContent'],
	allowedMentions: {}
});

djsClient.on('error', console.error);

const commands = [
	blacklistCommand,
	pingableRolesCommand,
	reactCommand,
	tagCommand,
	toolsCommand,
	triviaCommand,
	linkCommand
];
export const mahojiClient = new MahojiClient({
	applicationID: globalConfig.appID,
	commands,
	handlers: {
		preCommand: async ({ interaction }) => {
			if (interaction.guildId !== globalConfig.supportServerID) {
				return {
					reason: {
						content: 'You cannot use this bot outside the support server.',
						ephemeral: true
					},
					silent: false
				};
			}
		}
	}
});

djsClient.on('messageCreate', handleMessageCreate);
djsClient.on('ready', async () => {
	bulkUpdate();
});

djsClient.on('interactionCreate', async interaction => {
	if (interaction.isMessageContextMenuCommand()) {
		const command = messageCtxCommands.find(c => c.name === interaction.commandName);
		if (!command) {
			console.error(`Unknown message context menu command: ${interaction.commandName}`);
			return;
		}
		const message = await interaction.channel?.messages.fetch(interaction.targetId).catch(() => undefined);
		return command.run(interaction, message);
	}

	if (interaction.isButton()) {
		// For some reason, this only handles buttons now, probably should change the name
		await handleInteraction(interaction);
		return;
	}

	try {
		if (interaction.guildId !== globalConfig.supportServerID) {
			if (interaction.isRepliable()) {
				await interaction.reply({
					content: "You can't use this bot outside the support server."
				});
			}
			return;
		}

		if (interaction.isRepliable() && interaction.replied) return;
		const result = await mahojiClient.parseInteraction(interaction as any);
		if (result === null) return;
		if (isObject(result) && 'error' in result) {
			console.error(result.error);
		}
	} catch (err) {
		console.error(err);
	}
});

async function bulkUpdate() {
	const apiCommands = Array.from(mahojiClient.commands.values())
		.map(convertCommandToAPICommand)
		.map(_cmd => ({ ..._cmd, type: ApplicationCommandType.ChatInput }));
	await djsClient.rest.put(Routes.applicationGuildCommands(globalConfig.appID, globalConfig.supportServerID), {
		body: [
			...apiCommands,
			...messageCtxCommands
				.filter(_cmd => _cmd.guildID === globalConfig.supportServerID)
				.map(_cmd => ({ name: _cmd.name, type: ApplicationCommandType.Message }))
		]
	});
	await djsClient.rest.put(Routes.applicationGuildCommands(globalConfig.appID, TEST_SERVER_ID), {
		body: [
			...messageCtxCommands
				.filter(_cmd => _cmd.guildID === TEST_SERVER_ID)
				.map(_cmd => ({ name: _cmd.name, type: ApplicationCommandType.Message }))
		]
	});
}
