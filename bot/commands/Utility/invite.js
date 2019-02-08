const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, { description: 'Sends the invite link for the bot.' });
	}

	async run(msg) {
		return msg.send(`<https://invite.oldschool.gg/>`);
	}

};
