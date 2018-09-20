const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['servers', 'communities', 'community'],
			description: 'Shows some community servers related to OSRS..'
		});
	}

	async run(msg) {
		const embed = new MessageEmbed()
			.setTitle('Community Servers')
			.setColor(14981973)
			.setThumbnail(this.client.user.displayAvatarURL())
			.setDescription(servers);

		return msg.send({ embed });
	}

};

const servers = `
[Old School RuneScape](https://discord.gg/gbfNeqd)
Official Old School server
[IronScape](https://discord.gg/aGb6rms)
Community for ironmen
[We Do Raids](https://discord.gg/gREZC7f)
Raiding community
[RuneLite](https://discord.gg/SB8edn6)
Official RuneLite client server`;
