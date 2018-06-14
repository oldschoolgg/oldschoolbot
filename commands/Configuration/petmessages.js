const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 5,
			subcommands: true,
			description: 'Enables/disables Pet Messages, which rolls a chance at a pet on every message in a channel.',
			runIn: ['text'],
			usage: '<enable|disable>',
			permissionLevel: 6
		});
	}

	async enable(msg) {
		if (msg.guild.configs.petchannel === msg.channel.id) throw `Pet Messages are already enabled in this channel.`;
		if (msg.guild.configs.petchannel !== null) {
			await msg.guild.configs.update('petchannel', msg.channel, msg.guild);
			return msg.send(`Pet Messages are already enabled in another channel, but I've switched them to use this channel.`);
		}
		await msg.guild.configs.update('petchannel', msg.channel, msg.guild);
		return msg.send(`Enabled Pet Messages in this channel.`);
	}

	async disable(msg) {
		if (msg.guild.configs.petchannel === null) throw "Pet Messages aren't enabled, so you can't disable them.";
		await msg.guild.configs.reset('petchannel');
		return msg.send(`Disabled Pet Messages in this channel.`);
	}

};
