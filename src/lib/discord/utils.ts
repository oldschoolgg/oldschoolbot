import {
	ApplicationCommandType,
	type BaseMessageOptions,
	type ButtonInteraction,
	type InteractionReplyOptions,
	InteractionResponseType,
	type REST,
	type RESTPostAPIApplicationGuildCommandsJSONBody,
	Routes
} from 'discord.js';

import { globalConfig } from '@/lib/constants.js';
import { type AnyCommand, convertCommandOptionToAPIOption } from '@/lib/discord/commandOptions.js';

export function mentionCommand(name: string, subCommand?: string, subSubCommand?: string) {
	if (process.env.TEST) return '';
	const command = globalClient.allCommands.find(i => i.name === name);
	if (!command) {
		throw new Error(`Command ${name} not found`);
	}
	if (subCommand && !command.options.some(i => i.name === subCommand)) {
		throw new Error(`Command ${name} does not have subcommand ${subCommand}`);
	}

	const apiCommand = globalClient.application
		? Array.from(globalClient.application.commands.cache.values()).find(i => i.name === name)
		: null;
	if (!apiCommand) {
		throw new Error(`Command ${name} not found`);
	}

	if (subCommand) {
		return `</${name} ${subCommand}${subSubCommand ? ` ${subSubCommand}` : ''}:${apiCommand.id}>`;
	}

	return `</${name}:${apiCommand.id}>`;
}

export function normalizeMahojiResponse(one: any): BaseMessageOptions {
	if (!one) return {};
	if (typeof one === 'string') return { content: one };
	const response: BaseMessageOptions = {};
	if (one.content) response.content = one.content;
	if (one.files) response.files = one.files;
	if (one.components) response.components = one.components;
	return response;
}

export function roughMergeMahojiResponse(
	one: Awaited<CommandResponse>,
	two: Awaited<CommandResponse>
): InteractionReplyOptions {
	const first = normalizeMahojiResponse(one);
	const second = normalizeMahojiResponse(two);
	const newContent: string[] = [];

	const newResponse: InteractionReplyOptions = { content: '', files: [], components: [] };
	for (const res of [first, second]) {
		if (res.content) newContent.push(res.content);
		if (res.files) newResponse.files = [...newResponse.files!, ...res.files];
		if (res.components) newResponse.components = res.components;
	}
	newResponse.content = newContent.join('\n\n');

	return newResponse;
}

export async function silentButtonAck(interaction: ButtonInteraction) {
	return globalClient.rest.post(Routes.interactionCallback(interaction.id, interaction.token), {
		body: {
			type: InteractionResponseType.DeferredMessageUpdate
		}
	});
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

export interface BulkUpdateCommandOptions {
	commands?: ICommand[];
	guildID?: string | null;
	rest?: REST;
	applicationID?: string;
}

export async function bulkUpdateCommands(options: BulkUpdateCommandOptions = {}) {
	const { commands, guildID, rest = globalClient.rest, applicationID } = options;

	const resolvedApplicationID =
		applicationID ?? globalClient.application?.id ?? globalClient.user?.id ?? globalConfig.clientID;

	if (!resolvedApplicationID) {
		throw new Error('Unable to determine an application ID to sync commands.');
	}

	const commandsToSync = commands ?? globalClient.allCommands;
	const mapToApiCommands = (cmds: ICommand[]) => cmds.map(convertCommandToAPICommand);

	if (guildID !== undefined) {
		const filteredCommands = guildID === null ? commandsToSync.filter(i => !i.guildID) : commandsToSync;
		const route =
			guildID === null
				? Routes.applicationCommands(resolvedApplicationID)
				: Routes.applicationGuildCommands(resolvedApplicationID, guildID);
		return rest.put(route, { body: mapToApiCommands(filteredCommands) });
	}

	// Sync commands just to the testing server when not in production
	if (!globalConfig.isProduction) {
		const route = Routes.applicationGuildCommands(resolvedApplicationID, globalConfig.supportServerID);
		return rest.put(route, {
			body: mapToApiCommands(commandsToSync)
		});
	}

	// Sync commands globally
	const globalCommands = globalClient.allCommands.filter(i => !i.guildID).map(convertCommandToAPICommand);
	const guildCommands = globalClient.allCommands.filter(i => Boolean(i.guildID)).map(convertCommandToAPICommand);

	return Promise.all([
		rest.put(Routes.applicationCommands(resolvedApplicationID), { body: globalCommands }),
		rest.put(Routes.applicationGuildCommands(resolvedApplicationID, globalConfig.supportServerID), {
			body: guildCommands
		})
	]);
}
