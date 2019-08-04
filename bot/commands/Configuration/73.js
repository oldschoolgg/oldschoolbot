const { Command } = require('klasa');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 5,
			subcommands: true,
			description: "Enables/disables, reacts with 😂 everytime somebody says '73'.",
			runIn: ['text'],
			usage: '<enable|disable>',
			permissionLevel: 7
		});
	}

	async enable(msg) {
		const joyReactions = msg.guild.settings.get('joyReactions');
		if (joyReactions === msg.channel.id) {
			return msg.sendLocale('JOY_REACTIONS_ALREADY_ENABLED');
		}
		if (joyReactions) {
			await msg.guild.settings.update('joyReactions', msg.channel);
			return msg.sendLocale('JOY_REACTIONS_ENABLED_OTHER');
		}
		await msg.guild.settings.update('joyReactions', msg.channel);
		return msg.sendLocale('JOY_REACTIONS_ENABLED');
	}

	async disable(msg) {
		if (!msg.guild.settings.get('joyReactions')) {
			return msg.sendLocale('JOY_REACTIONS_ENABLED');
		}
		await msg.guild.settings.reset('joyReactions');
		return msg.sendLocale('JOY_REACTIONS_DISABLED');
	}
};
