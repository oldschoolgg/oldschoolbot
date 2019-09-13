const { Command } = require('klasa');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			guarded: true,
			description: 'Displays the voting link for the bot.'
		});
	}

	async run(msg) {
		return msg.send(
			`Voting is no longer a thing in Old School Bot, an alternative method of getting fake GP and pets will be coming soon.`
		);
	}
};
