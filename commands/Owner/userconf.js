const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, { permLevel: 10 });
	}

	run(msg) {
		return msg.send('This command is disabled.');
	}

};
