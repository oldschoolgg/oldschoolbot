const { Command } = require('klasa');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Checks what the previous name of a player was.',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [username]) {
		const result = await fetch(`https://www.crystalmathlabs.com/tracker/api.php?type=previousname&player=${username}`)
			.then(res => res.text());


		if (result.replace(/\s/g, '') === '-1') {
			return msg.send(`<:CrystalMathLabs:364657225249062912> Couldn't find any previous usernames for ${username}.`);
		} else {
			await this.cmlErrorCheck(msg, result);
			return msg.send(`The previous name for ${username} was: **${result}**`);
		}
	}

};
