import { ApplicationCommandType, type RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';

import { convertCommandOptionToAPIOption, type ICommand } from '@/lib/discord/index.js';
import { allCommands } from '@/mahoji/commands/allCommands.js';

function convertCommandToAPICommand(cmd: ICommand): RESTPostAPIApplicationCommandsJSONBody {
	return {
		type: ApplicationCommandType.ChatInput,
		name: cmd.name,
		description: cmd.description,
		options: cmd.options.map(convertCommandOptionToAPIOption)
	};
}

export function buildPayloadsFromAllCommands({ isProduction }: { isProduction: boolean }): {
	globalPayload: RESTPostAPIApplicationCommandsJSONBody[];
	supportGuildPayload: RESTPostAPIApplicationCommandsJSONBody[];
} {
	const globalCommands = isProduction ? allCommands.filter(cmd => !cmd.guildID) : [];
	const supportGuildCommands = isProduction ? allCommands.filter(cmd => Boolean(cmd.guildID)) : allCommands;

	return {
		globalPayload: globalCommands.map(convertCommandToAPICommand),
		supportGuildPayload: supportGuildCommands.map(convertCommandToAPICommand)
	};
}
