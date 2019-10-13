const { Command } = require('klasa');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			subcommands: true,
			description:
				'Enables/disables the Streamer Tweets function which sends tweets from OSRS Streamers.',
			runIn: ['text'],
			usage: '<enable|disable>',
			permissionLevel: 7,
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async enable(msg) {
		if (msg.guild.settings.get('streamertweets') === msg.channel.id) {
			return msg.sendLocale('STREAMER_TWEETS_ALREADY_ENABLED');
		}
		if (msg.guild.settings.get('streamertweets') !== null) {
			await msg.guild.settings.update('streamertweets', msg.channel, msg.guild);
			return msg.sendLocale('STREAMER_TWEETS_ENABLED_OTHER');
		}
		await msg.guild.settings.update('streamertweets', msg.channel, msg.guild);
		return msg.sendLocale('STREAMER_TWEETS_ENABLED');
	}

	async disable(msg) {
		if (msg.guild.settings.get('streamertweets') === null) {
			return msg.sendLocale('STREAMER_TWEETS_ARENT_ENABLED');
		}
		await msg.guild.settings.reset('streamertweets');
		return msg.sendLocale('STREAMER_TWEETS_DISABLED');
	}
};
