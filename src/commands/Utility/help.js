const { Command } = require('klasa');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			aliases: ['commands'],
			guarded: true,
			description: 'Get a list of commands for the bot.'
		});
	}

	async run(msg) {
		return msg.send(`https://www.oldschool.gg/commands`);
	}
};
