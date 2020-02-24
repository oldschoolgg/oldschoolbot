const { Command } = require('klasa');

module.exports = class extends Command {
	async run(msg) {
		throw `This command has been removed from Old School Bot. **However:** The exact same command is available in a bot called Skyra. Invite link: <http://invite.skyra.pw/>`;
	}
};
