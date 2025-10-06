import { ApplicationCommandType, type RESTPostAPIApplicationGuildCommandsJSONBody, Routes } from 'discord.js';

import { globalConfig, TEST_SERVER_ID } from '@/constants.js';
import { convertCommandOptionToAPIOption } from '@/discord/commandOptions.js';
import { messageCtxCommands } from '@/lib/messageCtxCommands.js';

function convertCommandToAPICommand(
	cmd: RoboChimpCommand
): RESTPostAPIApplicationGuildCommandsJSONBody & { description: string } {
	return {
		type: ApplicationCommandType.ChatInput,
		name: cmd.name,
		description: cmd.description,
		options: cmd.options.map(convertCommandOptionToAPIOption)
	};
}

export async function bulkUpdateCommands() {
	const chatInputCommands = globalClient.allCommands
		.map(convertCommandToAPICommand)
		.map(_cmd => ({ ..._cmd, type: ApplicationCommandType.ChatInput }));
	await globalClient.rest.put(Routes.applicationGuildCommands(globalConfig.appID, globalConfig.supportServerID), {
		body: [
			...chatInputCommands,
			...messageCtxCommands
				.filter(_cmd => _cmd.guildID === globalConfig.supportServerID)
				.map(_cmd => ({ name: _cmd.name, type: ApplicationCommandType.Message }))
		]
	});
	await globalClient.rest.put(Routes.applicationGuildCommands(globalConfig.appID, TEST_SERVER_ID), {
		body: [
			...messageCtxCommands
				.filter(_cmd => _cmd.guildID === TEST_SERVER_ID)
				.map(_cmd => ({ name: _cmd.name, type: ApplicationCommandType.Message }))
		]
	});
}
