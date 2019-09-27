const { Command } = require('klasa');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: 'Roll a random number between 1-100 or to a provided number.',
			usage: '[max:num{2,10000000}]'
		});
	}

	async run(msg, [max = 100]) {
		return msg.send(Math.floor(Math.random() * max) + 1);
	}
};
