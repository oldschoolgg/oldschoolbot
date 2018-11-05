const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 3,
			aliases: ['rl'],
			description: 'Shows information on RuneLite'
		});
	}

	async run(msg) {
		const embed = new MessageEmbed()
			.setTitle('<:RuneLite:418690749719117834> RuneLite')
			.setColor(16098851)
			.setThumbnail('https://runelite.net/img/logo.png')
			.setURL('https://runelite.net/')
			.setDescription(`RuneLite is a free, open source and lightweight client for Old School RuneScape.

The biggest benefit of RuneLite is that it is open-source, this means that: it is safer because anyone can see the code, anyone around the world can contribute new features to it, and improve the code.

https://runelite.net/`)
			.addField('Free', '100% Free for all', true)
			.addField('Open Source', 'https://github.com/runelite/runelite', true)
			.addField('Lightweight & fast', 'No lag, little memory usage', true)
			.addField('Many Features', 'https://runelite.net/features', true)
			.setFooter('*Use of any 3rd party client is not endorsed by Jagex, use at your own risk, use +clients to see others');
		return msg.send({ embed });
	}

};
