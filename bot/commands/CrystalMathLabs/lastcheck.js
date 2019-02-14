const { Command } = require('klasa');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: [],
			description: 'Checks when a CML Account was last updated.',
			usage: '[user:user|username:str]',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [username]) {
		username = this.getUsername(username, msg);

		const time = await fetch(`https://www.crystalmathlabs.com/tracker/api.php?type=lastcheck&player=${username}`)
			.then(res => res.text())
			.then(async res => await this.cmlErrorCheck(msg, res) || res);

		const embed = new MessageEmbed()
			.setColor(3120895)
			.setDescription(`**${username}** was last updated **${parseInt(time / 60)}** minutes ago.`);
		return msg.send({ embed });
	}

};
