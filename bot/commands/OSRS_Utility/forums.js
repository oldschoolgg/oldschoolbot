const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Shows the link for the official OSRS forum.',
			aliases: ['forum']
		});
	}

	async run(msg) {
		return msg.send('http://services.runescape.com/m=forum/forums.ws#group63');
	}

};
