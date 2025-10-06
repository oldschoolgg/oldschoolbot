import { ApplicationCommandType, type RESTPostAPIApplicationGuildCommandsJSONBody, Routes } from 'discord.js';

import { globalConfig } from '@/constants.js';
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
			...messageCtxCommands.map(_cmd => ({ name: _cmd.name, type: ApplicationCommandType.Message }))
		]
	});
}
