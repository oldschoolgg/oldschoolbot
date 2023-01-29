import { applicationCommands } from '..';

export function mentionCommand(name: string, subCommand?: string) {
	const command = globalClient.mahojiClient.commands.values.find(i => i.name === name);
	if (!command) {
		throw new Error(`Command ${name} not found`);
	}
	if (subCommand && !command.options.some(i => i.name === subCommand)) {
		throw new Error(`Command ${name} does not have subcommand ${subCommand}`);
	}

	const apiCommand = applicationCommands.find(i => i.name === name);
	if (!apiCommand) {
		throw new Error(`Command ${name} not found`);
	}

	if (subCommand) {
		return `</${name} ${subCommand}:${apiCommand.id}>`;
	}

	return `</${name}:${apiCommand.id}>`;
}
