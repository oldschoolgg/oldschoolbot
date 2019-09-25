const { Command } = require('klasa');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			permissionLevel: 6,
			description: 'Disable the bot in a channel.',
			usage: '<disable|enable>'
		});
	}

	async run(msg, [input]) {
		if (input === 'disable') {
			await msg.channel.settings.update('onlyStaffCanUseCommands', true);
			return msg.sendLocale('CHANNEL_DISABLED');
		} else {
			await msg.channel.settings.update('onlyStaffCanUseCommands', false);
			return msg.sendLocale('CHANNEL_ENABLED');
		}
	}
};
