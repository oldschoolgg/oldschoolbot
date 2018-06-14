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
		if (msg.guild.configs.joyReactions === msg.channel.id) throw `😂 Reactions are already enabled in this channel.`;
		if (msg.guild.configs.joyReactions !== null) {
			await msg.guild.configs.update('joyReactions', msg.channel, msg.guild);
			return msg.send(`😂 Reactions are already enabled in another channel, but I've switched them to use this channel.`);
		}
		await msg.guild.configs.update('joyReactions', msg.channel, msg.guild);
		return msg.send(`Enabled 😂 Reactions in this channel.`);
	}

	async disable(msg) {
		if (msg.guild.configs.joyReactions === null) throw "😂 Reactions aren't enabled, so you can't disable them.";
		await msg.guild.configs.reset('joyReactions');
		return msg.send(`Disabled 😂 Reactions in this channel.`);
	}


};
