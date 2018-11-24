const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			cooldown: 2,
			subcommands: true,
			description: 'Enable and Disable certain bot commands in your guild. Admins only.',
			usage: '<enable|disable> <command:cmd>',
			usageDelim: ' ',
			permissionLevel: 6
		});
	}

	async enable(msg, [command]) {
		if (!msg.guild.configs.disabledCommands.includes(command.name)) return msg.send("That command isn't disabled.");
		await msg.guild.configs.update('disabledCommands', command.name, { action: 'remove' });
		return msg.send(`Successfully enabled the \`${command.name}\` command.`);
	}

	async disable(msg, [command]) {
		if (msg.guild.configs.disabledCommands.includes(command.name)) return msg.send('That command is already disabled.');
		await msg.guild.configs.update('disabledCommands', command.name, { action: 'add' });
		return msg.send(`Successfully disabled the \`${command.name}\` command.`);
	}

};
