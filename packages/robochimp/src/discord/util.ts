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
	console.log(`Starting bulk command update of ${globalClient.allCommands.length} commands`);
	// if (!globalConfig.isProduction) {
	// 	console.log(`Not in production, clearing global commands for ${globalConfig.appID}`);
	// 	await globalClient.rest.put(Routes.applicationCommands(globalConfig.appID), {
	// 		body: [
	// 		]
	// 	});
	// 	await globalClient.rest.put(Routes.applicationCommands(globalConfig.appID), {
	// 		body: [
	// 		]
	// 	});
	// 	console.log('Cleared global commands');
	// }

	const chatInputCommands = globalClient.allCommands
		.map(convertCommandToAPICommand)
		.map(_cmd => ({ ..._cmd, type: ApplicationCommandType.ChatInput }));
	console.log(
		`Pushing ${chatInputCommands.length} commands to ${globalConfig.appID} - ${globalConfig.supportServerID}`
	);
	await globalClient.rest.put(Routes.applicationGuildCommands(globalConfig.appID, globalConfig.supportServerID), {
		body: [
			...chatInputCommands,
			...messageCtxCommands.map(_cmd => ({ name: _cmd.name, type: ApplicationCommandType.Message }))
		]
	});
	console.log(`Synced ${chatInputCommands.length} commands to the support server`);
}
