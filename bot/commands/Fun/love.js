const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Find out your love rating with someone!',
			usage: '<name:str>'
		});
	}

	async run(msg, [name]) {
		return msg.send(`${name} loves you ${(Math.floor(Math.random() * 100) + 1)}%!`);
	}

};
