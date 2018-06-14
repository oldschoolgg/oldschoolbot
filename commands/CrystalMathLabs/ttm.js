const { Command } = require('klasa');
const snekfetch = require('snekfetch');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: [],
			description: 'Shows the Time to Max of an account',
			usage: '[user:user|username:str]'
		});
	}

	async run(msg, [username]) {
		username = this.getUsername(username, msg);

		const ttm = await snekfetch
			.get(`https://crystalmathlabs.com/tracker/api.php?type=ttm&player=${username}`)
			.then(async res => await this.cmlErrorCheck(msg, res) || res.text)
			.catch(() => { throw this.client.cmlDown; });

		const embed = new MessageEmbed()
			.setColor(3120895)
			.setDescription(`**${username}**'s Time to Max is **${ttm}** hours.`);

		return msg.send({ embed });
	}

};
