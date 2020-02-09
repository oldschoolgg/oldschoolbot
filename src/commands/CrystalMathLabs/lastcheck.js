const { Command } = require('klasa');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: [],
			description: 'Checks when a CML Account was last updated.',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS'],
			enabled: false
		});
	}

	async run(msg, [username]) {
		const time = await fetch(
			`https://www.crystalmathlabs.com/tracker/api.php?type=lastcheck&player=${username}`
		).then(res => res.text());

		const embed = new MessageEmbed()
			.setColor(3120895)
			.setDescription(
				`**${username}** was last updated **${parseInt(time / 60)}** minutes ago.`
			);

		return msg.send({ embed });
	}
};
