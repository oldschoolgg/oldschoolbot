const { Command } = require('klasa');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

const { cmlErrorCheck } = require('../../../config/util');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 2,
			aliases: [],
			description: 'Shows the Time to Max of an account',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [username]) {
		const ttm = await fetch(
			`https://crystalmathlabs.com/tracker/api.php?type=ttm&player=${username}`
		)
			.then(res => res.text())
			.then(async res => cmlErrorCheck(msg, res) || res);

		const embed = new MessageEmbed()
			.setColor(3120895)
			.setDescription(`**${username}**'s Time to Max is **${ttm}** hours.`);

		return msg.send({ embed });
	}
};
