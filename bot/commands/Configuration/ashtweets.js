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
		if (ashTweetsChannel === msg.channel.id) throw `Ash Tweets are already enabled in this channel.`;
		if (ashTweetsChannel) {
			await msg.guild.settings.update('ashTweetsChannel', msg.channel);
			return msg.send(`Ash Tweets are already enabled in another channel, but I've switched them to use this channel.`);
		}
		await msg.guild.settings.update('ashTweetsChannel', msg.channel);
		return msg.send(`Enabled Ash Tweets in this channel.`);
	}

	async disable(msg) {
		if (!msg.guild.settings.get('ashTweetsChannel')) throw 'Ash Tweets are already disabled.';
		await msg.guild.settings.reset('ashTweetsChannel');
		return msg.send(`Disabled Ash Tweets in this channel.`);
	}

};
