const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 5,
			subcommands: true,
			description: 'Enables/disables Pet Messages, which rolls a chance at a pet on every message in a channel.',
			runIn: ['text'],
			usage: '<enable|disable>',
			permissionLevel: 7
		});
	}

	async enable(msg) {
		if (msg.guild.settings.get('petchannel')) {
			msg.sendLocale('PET_MESSAGES_ALREADY_ENABLED');
		}
		await msg.guild.settings.update('petchannel', msg.channel, msg.guild);
		return msg.sendLocale('PET_MESSAGES_ENABLED');
	}

	async disable(msg) {
		if (msg.guild.settings.get('petchannel') === null) {
			msg.sendLocale('PET_MESSAGES_ARENT_ENABLED');
		}
		await msg.guild.settings.reset('petchannel');
		return msg.sendLocale('PET_MESSAGES_DISABLED');
	}

};
