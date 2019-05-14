const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			permissionLevel: 6,
			description: 'Disable the bot in a channel.',
			usage: '<disable|enable>'
		});
	}

	async run(msg, [input]) {
		if (input === 'disable') {
			await msg.channel.settings.update('onlyStaffCanUseCommands', true);
			return msg.send(`Channel disabled. Staff can still use commands in this channel.`);
		} else {
			await msg.channel.settings.update('onlyStaffCanUseCommands', false);
			return msg.send(`Channel enabled. Anyone can use commands in this channel now.`);
		}
	}

};
