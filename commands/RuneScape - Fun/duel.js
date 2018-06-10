const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Simulates dueling another player.',
			usage: '<user:str>'
		});
	}

	async run(msg, [user]) {
		return msg.send(`${Math.random() >= 0.5 ? msg.author : user} won the duel with ${Math.floor((Math.random() * 30) + 1)} HP remaining.`);
	}

};
