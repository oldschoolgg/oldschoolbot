const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, { description: 'Roll a random number between 1-100.' });
	}

	async run(msg) {
		return msg.send(Math.floor(Math.random() * 100) + 1);
	}

};
