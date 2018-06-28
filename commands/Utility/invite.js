const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, { description: 'Sends the invite link for the bot.' });
	}

	async run(msg) {
		return msg.send(`
Add me to your server with this link: <http://bit.ly/2lDw8e7>`);
	}

};
