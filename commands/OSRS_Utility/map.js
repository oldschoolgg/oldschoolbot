const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Shows the link for the official OSRS map.',
			aliases: ['worldmap']
		});
	}

	async run(msg) {
		return msg.send('https://www.runescape.com/oldschool/world-map');
	}

};
