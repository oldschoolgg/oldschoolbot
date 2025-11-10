import { ApplicationCommandType, type RESTPostAPIApplicationGuildCommandsJSONBody, Routes } from '@oldschoolgg/discord';

import { convertCommandOptionToAPIOption } from '@/discord/index.js';
import { messageCtxCommands } from '@/lib/messageCtxCommands.js';
import { globalConfig } from '@/constants.js';

export function mentionCommand(name: string, subCommand?: string, subSubCommand?: string) {
	if (process.env.TEST) return '';
	const command = globalClient.allCommands.find(i => i.name === name);
	if (!command) {
		throw new Error(`Command ${name} not found`);
	}
	if (subCommand && !command.options.some(i => i.name === subCommand)) {
		throw new Error(`Command ${name} does not have subcommand ${subCommand}`);
	}

	const apiCommand = globalClient.applicationCommands!.find(i => i.name === name);
	if (!apiCommand) {
		throw new Error(`API Command ${name} not found`);
	}

	if (subCommand) {
		return `</${name} ${subCommand}${subSubCommand ? ` ${subSubCommand}` : ''}:${apiCommand.id}>`;
	}

	return `</${name}:${apiCommand.id}>`;
}

function convertCommandToAPICommand(
	cmd: AnyCommand
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

