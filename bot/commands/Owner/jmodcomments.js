const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			subcommands: true,
			enabled: false,
			description: 'Enables/disables the function which sends comments/posts from Jmods on reddit.',
			runIn: ['text'],
			usage: '<enable|disable>',
			permissionLevel: 6
		});
	}

	async enable(msg) {
		if (msg.guild.settings.get('jmodComments') === msg.channel.id) {
			throw `JMod Comments are already enabled in this channel.`;
		}
		if (msg.guild.settings.get('jmodComments') !== null) {
			await msg.guild.settings.update('jmodComments', msg.channel.id, msg.guild);
			return msg.send(
				`JMod Comments are already enabled in another channel, but I've switched them to use this channel.`
			);
		}
		await msg.guild.settings.update('jmodComments', msg.channel.id, msg.guild);
		return msg.send(`Enabled JMod Comments in this channel.`);
	}

	async disable(msg) {
		if (msg.guild.settings.get('jmodComments') === null) throw "JMod Comments aren't enabled, so you can't disable them.";
		await msg.guild.settings.reset('jmodComments');
		return msg.send(`Disabled JMod Comments in this channel.`);
	}

};
