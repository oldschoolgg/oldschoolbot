const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guarded: true,
			description: 'Displays the voting link for the bot.'
		});
	}

	async run(msg) {
		return msg.send(`
You can vote for Old School Bot here: <https://discordbots.org/bot/303730326692429825/vote>
`);
	}

};
