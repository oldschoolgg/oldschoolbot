const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			subcommands: true,
			description: 'Enables/disables the JMod Tweets function which sends tweets from OSRS JMods.',
			runIn: ['text'],
			usage: '<enable|disable>',
			permissionLevel: 7,
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async enable(msg) {
		const tweetChannel = msg.guild.settings.get('tweetchannel');
		if (tweetChannel === msg.channel.id) throw `JMod Tweets are already enabled in this channel.`;
		if (tweetChannel) {
			await msg.guild.settings.update('tweetchannel', msg.channel);
			return msg.send(`JMod Tweets are already enabled in another channel, but I've switched them to use this channel.`);
		}
		await msg.guild.settings.update('tweetchannel', msg.channel);
		return msg.send(`Enabled JMod Tweets in this channel.`);
	}

	async disable(msg) {
		if (!msg.guild.settings.get('tweetchannel')) throw 'JMod Tweets are already disabled.';
		await msg.guild.settings.reset('tweetchannel');
		return msg.send(`Disabled JMod Tweets in this channel.`);
	}

};
