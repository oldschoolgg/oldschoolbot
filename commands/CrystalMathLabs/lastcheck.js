const { Command } = require('klasa');
const snekfetch = require('snekfetch');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: [],
			description: 'Checks when a CML Account was last updated.',
			usage: '[user:user|username:str]'
		});
	}

	async run(msg, [username]) {
		username = this.getUsername(username, msg);

		const time = await snekfetch
			.get(`https://www.crystalmathlabs.com/tracker/api.php?type=lastcheck&player=${username}`)
			.then(async res => await this.cmlErrorCheck(msg, res) || res.text)
			.catch(() => { throw this.client.cmlDown; });

		const embed = new MessageEmbed()
			.setColor(3120895)
			.setDescription(`**${username}** was last updated **${parseInt(time / 60)}** minutes ago.`);
		return msg.send({ embed });
	}

};
