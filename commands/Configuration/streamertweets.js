const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			subcommands: true,
			description: 'Enables/disables the Streamer Tweets function which sends tweets from OSRS Streamers.',
			runIn: ['text'],
			usage: '<enable|disable>',
			permissionLevel: 6
		});
	}

	async enable(msg) {
		if (msg.guild.configs.streamertweets === msg.channel.id) throw `Streamer Tweets are already enabled in this channel.`;
		if (msg.guild.configs.streamertweets !== null) {
			await msg.guild.configs.update('streamertweets', msg.channel, msg.guild);
			return msg.send(`Streamer Tweets are already enabled in another channel, but I've switched them to use this channel.`);
		}
		await msg.guild.configs.update('streamertweets', msg.channel, msg.guild);
		return msg.send(`Enabled Streamer Tweets in this channel.`);
	}

	async disable(msg) {
		if (msg.guild.configs.streamertweets === null) throw "Streamer Tweets aren't enabled, so you can't disable them.";
		await msg.guild.configs.reset('streamertweets');
		return msg.send(`Disabled Streamer Tweets in this channel.`);
	}

	async init() {
		if (!this.client.gateways.guilds.schema.has('streamertweets')) {
			await this.client.gateways.guilds.schema.add('streamertweets', { type: 'textchannel' });
		}
	}

};
