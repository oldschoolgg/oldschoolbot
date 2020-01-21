const { Command } = require('klasa');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			subcommands: true,
			description: 'Enables/disables HCIM Death Tweets from @HCIM Deaths on Twitter.',
			runIn: ['text'],
			usage: '<enable|disable>',
			permissionLevel: 6,
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async enable(msg) {
		if (msg.guild.settings.get('hcimdeaths') === msg.channel.id) {
			return msg.sendLocale('HCIM_TWEETS_ALREADY_ENABLED');
		}
		if (msg.guild.settings.get('hcimdeaths')) {
			await msg.guild.settings.update('hcimdeaths', msg.channel);
			return msg.sendLocale('HCIM_TWEETS_ENABLED_OTHER');
		}
		await msg.guild.settings.update('hcimdeaths', msg.channel);
		return msg.sendLocale('HCIM_TWEETS_ENABLED');
	}

	async disable(msg) {
		if (!msg.guild.settings.get('hcimdeaths')) {
			return msg.sendLocale('HCIM_TWEETS_ARENT_ENABLED');
		}
		await msg.guild.settings.reset('hcimdeaths');
		return msg.sendLocale('HCIM_TWEETS_DISABLED');
	}
};
