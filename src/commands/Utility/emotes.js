const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			aliases: ['emoteservers'],
			description: 'Shows all the emote servers that the bot uses.',
			requiredPermissions: ['EMBED_LINKS']
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
https://discord.gg/Tc3cdbc
https://discord.gg/qrEmgZU
https://discord.gg/qBF9XFG
https://discord.gg/PW5WuRS
https://discord.gg/JdZAQqA
https://discord.gg/6C5T3Xh
https://discord.gg/nfzkxFZ`;
