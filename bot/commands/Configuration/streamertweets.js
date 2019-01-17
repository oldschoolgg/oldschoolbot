const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			subcommands: true,
			description: 'Enables/disables the Streamer Tweets function which sends tweets from OSRS Streamers.',
			runIn: ['text'],
			usage: '<enable|disable>',
			permissionLevel: 6,
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async enable(msg) {
		if (msg.guild.settings.get('streamertweets') === msg.channel.id) throw `Streamer Tweets are already enabled in this channel.`;
		if (msg.guild.settings.get('streamertweets') !== null) {
			await msg.guild.settings.update('streamertweets', msg.channel, msg.guild);
			return msg.send(`Streamer Tweets are already enabled in another channel, but I've switched them to use this channel.`);
		}
		await msg.guild.settings.update('streamertweets', msg.channel, msg.guild);
		return msg.send(`Enabled Streamer Tweets in this channel.`);
	}

	async disable(msg) {
		if (msg.guild.settings.get('streamertweets') === null) throw "Streamer Tweets aren't enabled, so you can't disable them.";
		await msg.guild.settings.reset('streamertweets');
		return msg.send(`Disabled Streamer Tweets in this channel.`);
	}

};
