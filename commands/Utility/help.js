const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['commands'],
			guarded: true,
			description: 'Get a list of commands for the bot.'
		});
	}

	async run(msg) {
		const embed = new MessageEmbed()
			.setTitle('Commands')
			.setColor(14981973)
			.setThumbnail(this.client.user.displayAvatarURL())
			.setDescription('You can view the Command List in one of these formats:')
			.addField('Table Format', `[commands.md](https://github.com/gc/oldschoolbot/blob/master/commands.md)`, true)
			.addField('Plain Text', `[commands.txt](https://raw.githubusercontent.com/gc/oldschoolbot/master/commands.txt)`, true)
			.setFooter(this.client.user.username, this.client.user.displayAvatarURL());

		return msg.send({ embed });
	}

};
