const { Command, Timestamp } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Get information on a mentioned user.',
			requiredPermissions: ['EMBED_LINKS']
		});
		this.timestamp = new Timestamp('d MMMM YYYY');
	}

	async run(msg, [guild = msg.guild]) {
		const embed = new MessageEmbed()
			.setColor(16098851)
			.setThumbnail(guild.iconURL())
			.setAuthor(guild.name)
			.addField('Total Members', guild.memberCount || 'Not Set', true)
			.addField('Total Commands Used', guild.settings.get('totalCommandsUsed'), true)
			.addField('Server Creation Date', this.timestamp.display(guild.createdAt), true)
			.addField('Bot Prefix', guild.settings.get('prefix'), true);

		return msg.send({ embed });
	}

};
