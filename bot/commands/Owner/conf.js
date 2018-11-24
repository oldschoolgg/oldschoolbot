const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, { permissionLevel: 10 });
	}

	run(msg) {
		return msg.send('This command is disabled.');
	}

};
