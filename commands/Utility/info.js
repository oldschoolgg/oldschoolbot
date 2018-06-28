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
Old School Bot is an open-source Discord Bot based on Old School RuneScape.

	- Github/Code: <https://github.com/gc/oldschoolbot/> ⭐

	- Old School Bot uses Klasa, a Discord Bot framework.

	- If you have any other enquiries, join the support server!

	- Support Server: https://discord.gg/ypZbV7c
`);
	}

};
