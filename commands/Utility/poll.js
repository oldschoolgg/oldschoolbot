const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, { description: 'Temporary poll.' });
	}

	async run(msg) {
		return msg.send(`Please vote on this poll! https://www.strawpoll.me/15843965`);
	}

};
