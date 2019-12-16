const { Command } = require('klasa');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: 'Roll a random number between 1-100 or to a provided number.',
			usage: '[max:int{2}]'
		});
	}

	async run(msg, [max = 100]) {
		if (max > 10000000) throw "I can't roll a number higher than 10 million!";
		return msg.send((Math.floor(Math.random() * max) + 1).toLocaleString());
	}
};
