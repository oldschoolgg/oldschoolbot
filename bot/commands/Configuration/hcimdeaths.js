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
		if (msg.guild.settings.hcimdeaths === msg.channel.id) {
			throw `HCIM Death Tweets are already enabled in this channel.`;
		}
		if (msg.guild.settings.hcimdeaths) {
			await msg.guild.settings.update('hcimdeaths', msg.channel);
			return msg.send(`HCIM Death Tweets are already enabled in another channel, but I've switched them to use this channel.`);
		}
		await msg.guild.settings.update('hcimdeaths', msg.channel);
		return msg.send(`Enabled HCIM Death Tweets in this channel.`);
	}

	async disable(msg) {
		if (!msg.guild.settings.hcimdeaths) {
			throw "HCIM Death Tweets aren't enabled, so you can't disable them.";
		}
		await msg.guild.settings.reset('hcimdeaths');
		return msg.send(`Disabled HCIM Death Tweets in this channel.`);
	}

};
