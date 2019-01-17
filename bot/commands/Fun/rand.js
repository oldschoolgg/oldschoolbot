const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: '[REMOVED]'
		});
	}

	async run(msg) {
		return msg.send('This command has sadly been removed from Old School Bot permanently, as it has the potential ' +
			"to post NSFW content which isn't something we want in a family-friendly bot. If you'd still like to use this " +
		'command, you can add this bot which has the exact same command: <https://invite.ordobot.me>.');
	}

};
