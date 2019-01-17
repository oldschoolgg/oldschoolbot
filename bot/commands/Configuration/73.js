const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 5,
			subcommands: true,
			description: "Enables/disables, reacts with 😂 everytime somebody says '73'.",
			runIn: ['text'],
			usage: '<enable|disable>',
			permissionLevel: 6
		});
	}

	async enable(msg) {
		const joyReactions = msg.guild.settings.get('joyReactions');
		if (joyReactions === msg.channel.id) {
			throw `😂 Reactions are already enabled in this channel.`;
		}
		if (joyReactions) {
			await msg.guild.settings.update('joyReactions', msg.channel);
			return msg.send(`😂 Reactions are already enabled in another channel, but I've switched them to use this channel.`);
		}
		await msg.guild.settings.update('joyReactions', msg.channel);
		return msg.send(`Enabled 😂 Reactions in this channel.`);
	}

	async disable(msg) {
		if (!msg.guild.settings.get('joyReactions')) {
			throw "😂 Reactions aren't enabled, so you can't disable them.";
		}
		await msg.guild.settings.reset('joyReactions');
		return msg.send(`Disabled 😂 Reactions in this channel.`);
	}


};
