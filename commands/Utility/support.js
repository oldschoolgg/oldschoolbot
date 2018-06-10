const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, { description: 'Displays the Support Server invite link.' });
	}

	async run(msg) {
		return msg.send(`Join the Support server for any questions or suggestions: https://discord.gg/WJWmAuJ`);
	}

};
