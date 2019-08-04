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
			permissionLevel: 7
		});
	}

	async enable(msg, [command]) {
		if (!msg.guild.settings.get('disabledCommands').includes(command.name)) {
			return msg.sendLocale('CMD_ISNT_DISABLED');
		}
		await msg.guild.settings.update('disabledCommands', command.name, { action: 'remove' });
		return msg.sendLocale('CMD_ENABLED', [command.name]);
	}

	async disable(msg, [command]) {
		if (msg.guild.settings.get('disabledCommands').includes(command.name)) {
			return msg.sendLocale('CMD_ALREADY_DISABLED');
		}
		await msg.guild.settings.update('disabledCommands', command.name, { action: 'add' });
		return msg.sendLocale('CMD_DISABLED', [command.name]);
	}
};
