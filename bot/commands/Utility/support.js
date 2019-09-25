const { Command } = require('klasa');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, { description: 'Shows the support link for the bot.' });
	}

	async run(msg) {
		return msg.send(`Support Server: http://support.oldschool.gg`);
	}
};
