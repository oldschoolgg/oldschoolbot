const { Command } = require('klasa');
const snekfetch = require('snekfetch');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Checks what the previous name of a player was.',
			usage: '[user:user|username:str]'
		});
	}

	async run(msg, [username]) {
		username = this.getUsername(username, msg);

		const result = await snekfetch
			.get(`https://www.crystalmathlabs.com/tracker/api.php?type=previousname&player=${username}`)
			.then(res => res)
			.catch(() => { throw this.client.cmlDown; });

		if (result.text.replace(/\s/g, '') === '-1') {
			const embed = new MessageEmbed()
				.setColor(8311585)
				.setDescription(`<:CrystalMathLabs:364657225249062912> Couldn't find any previous usernames for ${username}.`);
			return msg.send({ embed });
		} else {
			const embed = new MessageEmbed()
				.setColor(8311585)
				.setDescription(`The previous name for ${username} was: **${result.text}**`);
			return msg.send({ embed });
		}
	}

};
