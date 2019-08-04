const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, { description: 'This command has been removed.' });
	}

	async run(msg) {
		const embed = new MessageEmbed().setDescription(
			`This command has been removed. If you wish to continue using it, you may add [this bot](https://discordapp.com/oauth2/authorize?client_id=474918935494393876&permissions=66186303&scope=bot).`
		);

		return msg.send({ embed });
	}
};
