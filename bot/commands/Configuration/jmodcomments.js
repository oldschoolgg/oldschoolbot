const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			subcommands: true,
			enabled: true,
			description: 'Enables/disables the function which sends comments/posts from Jmods on reddit.',
			runIn: ['text'],
			usage: '<enable|disable>',
			permissionLevel: 7
		});
	}

	async enable(msg) {
		if (msg.guild.settings.get('jmodComments') === msg.channel.id) {
			msg.sendLocale('JMOD_COMMENTS_ALREADY_ENABLED');
		}
		if (msg.guild.settings.get('jmodComments') !== null) {
			await msg.guild.settings.update('jmodComments', msg.channel.id, msg.guild);
			return msg.sendLocale('JMOD_COMMENTS_ENABLED_OTHER');
		}
		await msg.guild.settings.update('jmodComments', msg.channel.id, msg.guild);
		return msg.sendLocale('JMOD_COMMENTS_ENABLED');
	}

	async disable(msg) {
		if (msg.guild.settings.get('jmodComments') === null) {
			msg.sendLocale('JMOD_COMMENTS_ARENT_ENABLED');
		}
		await msg.guild.settings.reset('jmodComments');
		return msg.sendLocale('JMOD_COMMENTS_DISABLED');
	}

};
