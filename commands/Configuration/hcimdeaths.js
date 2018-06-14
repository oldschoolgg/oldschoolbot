const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			subcommands: true,
			description: 'Enables/disables HCIM Death Tweets from @HCIM Deaths on Twitter.',
			runIn: ['text'],
			usage: '<enable|disable>',
			permissionLevel: 6
		});
	}

	async enable(msg) {
		if (msg.guild.configs.hcimdeaths === msg.channel.id) throw `HCIM Death Tweets are already enabled in this channel.`;
		if (msg.guild.configs.hcimdeaths !== null) {
			await msg.guild.configs.update('hcimdeaths', msg.channel, msg.guild);
			return msg.send(`HCIM Death Tweets are already enabled in another channel, but I've switched them to use this channel.`);
		}
		await msg.guild.configs.update('hcimdeaths', msg.channel, msg.guild);
		return msg.send(`Enabled HCIM Death Tweets in this channel.`);
	}

	async disable(msg) {
		if (msg.guild.configs.hcimdeaths === null) throw "HCIM Death Tweets aren't enabled, so you can't disable them.";
		await msg.guild.configs.reset('hcimdeaths');
		return msg.send(`Disabled HCIM Death Tweets in this channel.`);
	}

	async init() {
		if (!this.client.gateways.guilds.schema.has('autoupdate')) {
			await this.client.gateways.guilds.schema.add('autoupdate', { type: 'textchannel' });
		}
	}

};
