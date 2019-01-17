const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Shows the link for the official OSRS hiscores.',
			aliases: ['hs']
		});
	}

	async run(msg) {
		return msg.send('https://secure.runescape.com/m=hiscore_oldschool/overall.ws');
	}

};
