const { Command } = require('klasa');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, { description: 'Shows the collections link.' });
	}

	async run(msg) {
		return msg.send(
			`Create online, shareable collection logs for your OSRS accounts! <https://www.oldschool.gg/collections>
			
100% free, no ads, no personal data is collected.`
		);
	}
};
