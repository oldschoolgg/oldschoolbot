const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			subcommands: true,
			description: 'Receive every tweet from God Ash in your discord channel!.',
			runIn: ['text'],
			usage: '<enable|disable>',
			permissionLevel: 7,
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async enable(msg) {
		const ashTweetsChannel = msg.guild.settings.get('ashTweetsChannel');
		if (ashTweetsChannel === msg.channel.id) return msg.sendLocale('ASH_TWEETS_ALREADY_ENABLED');
		if (ashTweetsChannel) {
			await msg.guild.settings.update('ashTweetsChannel', msg.channel);
			return msg.sendLocale('ASH_TWEETS_ENABLED_OTHER');
		}
		await msg.guild.settings.update('ashTweetsChannel', msg.channel);
		return msg.sendLocale('ASH_TWEETS_ENABLED');
	}

	async disable(msg) {
		if (!msg.guild.settings.get('ashTweetsChannel')) return msg.sendLocale('ASH_TWEETS_ARENT_ENABLED');
		await msg.guild.settings.reset('ashTweetsChannel');
		return msg.sendLocale(`ASH_TWEETS_DISABLED`);
	}

};
