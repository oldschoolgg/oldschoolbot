import { ApplicationCommandType, type RESTPostAPIApplicationGuildCommandsJSONBody, Routes } from '@oldschoolgg/discord';

import { globalConfig } from '@/lib/constants.js';
import { convertCommandOptionToAPIOption } from '@/lib/discord/commandOptionConversions.js';
import type { AnyCommand } from '@/lib/discord/commandOptions.js';

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
	if (!globalConfig.isProduction) {
		const body = globalClient.allCommands.map(convertCommandToAPICommand);
		return globalClient.rest.put(globalClient.apiCommandsRoute(), {
			body
		});
	}

	// Sync commands globally
	const globalCommands = globalClient.allCommands.filter(i => !i.guildId).map(convertCommandToAPICommand);
	const guildCommands = globalClient.allCommands.filter(i => Boolean(i.guildId)).map(convertCommandToAPICommand);

	return Promise.all([
		globalClient.rest.put(Routes.applicationCommands(globalClient.applicationId), { body: globalCommands }),
		globalClient.rest.put(
			Routes.applicationGuildCommands(globalClient.applicationId, globalConfig.supportServerID),
			{
				body: guildCommands
			}
		)
	]);
}
