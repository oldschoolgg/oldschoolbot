const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guarded: true,
			description: 'Displays information about the bot.'
		});
	}

	async run(msg) {
		return msg.send(`
Old School Bot is a Discord Bot based upon Old School RuneScape.

 - Support server: <https://discordapp.com/invite/WJWmAuJ>

 - Old School Bot uses Klasa, a Discord Bot framework.

 - If you have any other enquiries, join the support server!
`);
	}

};
