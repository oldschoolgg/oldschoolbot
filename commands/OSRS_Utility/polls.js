const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, { description: 'Shows the link for the OSRS Polls.' });
	}

	async run(msg) {
		return msg.send('http://services.runescape.com/m=poll/oldschool/index.ws');
	}

};
