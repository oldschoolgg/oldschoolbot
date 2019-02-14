const { Command } = require('klasa');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 2,
			description: 'Update a CML profile.',
			usage: '[user:user|username:str]',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [username]) {
		username = this.getUsername(username, msg);

		const update = await fetch(`https://www.crystalmathlabs.com/tracker/api.php?type=update&player=${username}`)
			.then(res => res.text())
			.then(async res => {
				await this.cmlErrorCheck(msg, res);
				switch (res.replace(/\s/g, '')) {
					case '1':
						return `Successfully updated **${username}**`;
					case '5':
						return `That player was already updated within the last 30 seconds.`;
					case '6':
						return `Invalid username.`;
					default:
						return `That player doesn't exist, or is banned.`;
				}
			});

		const embed = new MessageEmbed()
			.setColor(3120895)
			.setDescription(update);

		return msg.send({ embed });
	}

};
