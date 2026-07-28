import { ApplicationCommandType, type RESTPostAPIApplicationGuildCommandsJSONBody, Routes } from '@oldschoolgg/discord';

import { convertCommandOptionToAPIOption } from '@/discord/index.js';
import { globalConfig } from '@/lib/constants.js';

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

export async function resolveSendable(sendable: SendableMessage) {
	// SendableMessage is of type: string | BaseSendableMessage | AnyClassWithBuild
	// Todo: BaseSendableMessage can still be the type, but not have any content, so maybe we add resolution of
	//   embeds and attachments?

	if (typeof sendable === 'string') {
		// string
		return sendable;
	} else if ('content' in sendable) {
		// BaseSendableMessage
		return sendable.content;
	} else if ('build' in sendable && typeof sendable.build === 'function') {
		// AnyClassWithBuild
		return await resolveSendable(await sendable.build());
	}
	return undefined;
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
