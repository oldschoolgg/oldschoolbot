const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			subcommands: true,
			description: 'Enables/disables the JMod Tweets function which sends tweets from OSRS JMods.',
			runIn: ['text'],
			usage: '<enable|disable>',
			permissionLevel: 6
		});
	}

	async enable(msg) {
		if (msg.guild.configs.tweetchannel === msg.channel.id) throw `JMod Tweets are already enabled in this channel.`;
		if (msg.guild.configs.tweetchannel !== null) {
			await msg.guild.configs.update('tweetchannel', msg.channel, msg.guild);
			return msg.send(`JMod Tweets are already enabled in another channel, but I've switched them to use this channel.`);
		}
		await msg.guild.configs.update('tweetchannel', msg.channel, msg.guild);
		return msg.send(`Enabled JMod Tweets in this channel.`);
	}

	async disable(msg) {
		if (msg.guild.configs.tweetchannel === null) throw 'JMod Tweets are already disabled.';
		await msg.guild.configs.reset('tweetchannel');
		return msg.send(`Disabled JMod Tweets in this channel.`);
	}

	async init() {
		if (!this.client.gateways.guilds.schema.has('tweetchannel')) {
			await this.client.gateways.guilds.schema.add('tweetchannel', { type: 'textchannel' });
		}
	}

};
