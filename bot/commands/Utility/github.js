const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, { description: 'Shows the Github link.' });
	}

	async run(msg) {
		return msg.send(`<:OSRSBot:363583286192111616> Old School Bot is now open-source! <https://github.com/gc/oldschoolbot>`);
	}

};
