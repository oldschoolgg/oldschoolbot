const { Command, Timestamp } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Get information on a mentioned user.',
			usage: '[Member:member]',
			requiredPermissions: ['EMBED_LINKS']
		});
		this.timestamp = new Timestamp('d MMMM YYYY');
	}

	async run(msg, [member]) {
		if (!member) member = await msg.guild.members.fetch(msg.author.id);
		const { user, joinedTimestamp } = member;
		const commandsUsed = user.configs.totalCommandsUsed && user.configs.totalCommandsUsed.toLocaleString() || 0;
		const embed = new MessageEmbed()
			.setColor(16098851)
			.setThumbnail(member.user.displayAvatarURL())
			.setAuthor(member.user.username)
			.addField('RuneScape Username', user.configs.RSN || 'Not Set', true)
			.addField('Total Commands Used', user.configs.totalCommandsUsed.toLocaleString() || 0, true)
			.addField('Discord Join Date', this.timestamp.display(user.createdAt), true)
			.addField('Server Join Date', this.timestamp.display(joinedTimestamp), true);

		return msg.send({ embed });
	}

};
