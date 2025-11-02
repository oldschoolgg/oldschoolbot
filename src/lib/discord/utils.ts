import { ApplicationCommandType, type RESTPostAPIApplicationGuildCommandsJSONBody, Routes } from '@oldschoolgg/discord';

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

	const apiCommand = globalClient.applicationCommands!.find(i => i.name === name);
	if (!apiCommand) {
		throw new Error(`Command ${name} not found`);
	}

	if (subCommand) {
		return `</${name} ${subCommand}${subSubCommand ? ` ${subSubCommand}` : ''}:${apiCommand.id}>`;
	}

	return `</${name}:${apiCommand.id}>`;
}

// export function normalizeMahojiResponse(one: any): BaseMessageOptions {
// 	if (!one) return {};
// 	if (typeof one === 'string') return { content: one };
// 	const response: BaseMessageOptions = {};
// 	if (one.content) response.content = one.content;
// 	if (one.files) response.files = one.files;
// 	if (one.components) response.components = one.components;
// 	return response;
// }

// TODO
export function roughMergeMahojiResponse(_one: Awaited<CommandResponse>, _two: Awaited<CommandResponse>): any {
	// const first = normalizeMahojiResponse(one);
	// const second = normalizeMahojiResponse(two);
	// const newContent: string[] = [];

	// const newResponse: InteractionReplyOptions = { content: '', files: [], components: [] };
	// for (const res of [first, second]) {
	// 	if (res.content) newContent.push(res.content);
	// 	if (res.files) newResponse.files = [...newResponse.files!, ...res.files];
	// 	if (res.components) newResponse.components = res.components;
	// }
	// newResponse.content = newContent.join('\n\n');

	return {} as any;
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
	const appUser = globalClient.applicationUser!;
	// Sync commands just to the testing server
	if (!globalConfig.isProduction) {
		const body = globalClient.allCommands.map(convertCommandToAPICommand);
		const route = Routes.applicationGuildCommands(appUser.id, globalConfig.supportServerID);
		return globalClient.rest.put(route, {
			body
		});
	}

	// Sync commands globally
	const globalCommands = globalClient.allCommands.filter(i => !i.guildId).map(convertCommandToAPICommand);
	const guildCommands = globalClient.allCommands.filter(i => Boolean(i.guildId)).map(convertCommandToAPICommand);

	return Promise.all([
		globalClient.rest.put(Routes.applicationCommands(appUser.id), { body: globalCommands }),
		globalClient.rest.put(Routes.applicationGuildCommands(appUser.id, globalConfig.supportServerID), {
			body: guildCommands
		})
	]);
}
