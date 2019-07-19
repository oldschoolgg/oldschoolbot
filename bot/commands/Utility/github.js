const { Command } = require('klasa');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, { description: 'Shows the Github link.' });
	}

	async run(msg) {
		return msg.send(
			`<:OSBot:601768469905801226> Old School Bot is now open-source! <https://github.oldschool.gg/>`
		);
	}
};
