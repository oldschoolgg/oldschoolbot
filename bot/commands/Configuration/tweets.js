const { Command } = require('klasa');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			subcommands: true,
			description:
				'Enables/disables the JMod Tweets function which sends tweets from OSRS JMods.',
			runIn: ['text'],
			usage: '<enable|disable>',
			permissionLevel: 7,
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async enable(msg) {
		const tweetChannel = msg.guild.settings.get('tweetchannel');
		if (tweetChannel === msg.channel.id) return msg.sendLocale('JMOD_TWEETS_ALREADY_ENABLED');
		if (tweetChannel) {
			await msg.guild.settings.update('tweetchannel', msg.channel);
			return msg.sendLocale('JMOD_TWEETS_ENABLED_OTHER');
		}
		await msg.guild.settings.update('tweetchannel', msg.channel);
		return msg.sendLocale('JMOD_TWEETS_ENABLED');
	}

	async disable(msg) {
		if (!msg.guild.settings.get('tweetchannel')) {
			return msg.sendLocale('JMOD_TWEETS_ARENT_ENABLED');
		}
		await msg.guild.settings.reset('tweetchannel');
		return msg.sendLocale('JMOD_TWEETS_DISABLED');
	}
};
