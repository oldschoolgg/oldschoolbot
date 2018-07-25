const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['emoteservers'],
			description: 'Shows all the emote servers that the bot uses.'
		});
	}

	async run(msg) {
		const embed = new MessageEmbed()
			.setTitle('Emote Servers')
			.setColor(14981973)
			.setThumbnail(this.client.user.displayAvatarURL())
			.setDescription(servers);

		return msg.send({ embed });
	}

};

const servers = `
https://discord.gg/SB8edn6
https://discord.gg/hBAySb3
https://discord.gg/9DtWEXH
https://discord.gg/8GR2fZM
https://discord.gg/j7s22Mc
https://discord.gg/JWGsNRy`;
