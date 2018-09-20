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
[Old School RuneScape - Official Old School server](https://discord.gg/gbfNeqd)
[IronScape - Community for ironmen](https://discord.gg/aGb6rms)
[We Do Raids - Raiding community](https://discord.gg/gREZC7f)
[RuneLite - Official RuneLite client server](https://discord.gg/SB8edn6)`;
