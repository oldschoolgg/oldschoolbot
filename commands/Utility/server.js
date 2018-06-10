const { Command, Timestamp } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, { description: 'Get information on a mentioned user.' });
		this.timestamp = new Timestamp('d MMMM YYYY');
	}

	async run(msg, [guild = msg.guild]) {
		const embed = new this.client.methods.Embed()
			.setColor(16098851)
			.setThumbnail(guild.iconURL())
			.setAuthor(guild.name)
			.addField('Total Members', guild.memberCount || 'Not Set', true)
			.addField('Total Commands Used', guild.configs.totalCommandsUsed, true)
			.addField('Server Creation Date', this.timestamp.display(guild.createdAt), true)
			.addField('Bot Prefix', guild.configs.prefix, true);

		return msg.send({ embed });
	}

};
