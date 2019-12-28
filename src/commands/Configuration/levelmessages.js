const { Command } = require('klasa');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			subcommands: true,
			enabled: true,
			aliases: ['lm'],
			description:
				'Enables/disables the function which sends update notifications for users with RSN set in the server.',
			runIn: ['text'],
			usage: '<enable|disable>',
			permissionLevel: 7
		});
	}

	async enable(msg) {
		if (msg.guild.settings.get('levelUpMessages') === msg.channel.id) {
			return msg.send('Level-Up messages are already set to this channel.');
		}
		if (msg.guild.settings.get('levelUpMessages') !== null) {
			await msg.guild.settings.update('levelUpMessages', msg.channel.id, msg.guild);
			this.client.tasks.get('usernameCacher').run();

			return msg.send(
				`Level-Up messages were already enabled in another channel, but I've switched them to use this channel.`
			);
		}

		await msg.guild.settings.update('levelUpMessages', msg.channel.id, msg.guild);
		this.client.tasks.get('usernameCacher').run();

		return msg.send('Enabled Level-Up messages in this channel.');
	}

	async disable(msg) {
		if (msg.guild.settings.get('levelUpMessages') === null) {
			msg.send(`Level-Up messages aren't enabled, so you can't disable them.`);
		}
		await msg.guild.settings.reset('levelUpMessages');
		this.client.tasks.get('usernameCacher').run();
		return msg.send('Disabled Level-Up messages.');
	}
};
