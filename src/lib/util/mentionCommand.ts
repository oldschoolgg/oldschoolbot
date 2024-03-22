export function mentionCommand(name: string, subCommand?: string, subSubCommand?: string) {
	if (process.env.TEST) return '';
	const command = globalClient.mahojiClient.commands.values.find(i => i.name === name);
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
