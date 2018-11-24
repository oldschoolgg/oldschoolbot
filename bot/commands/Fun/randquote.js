const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Returns a random message from someone in the channel.',
			cooldown: 10,
			requiredPermissions: ['READ_MESSAGE_HISTORY']
		});
	}

	async run(msg) {
		let messageBank = await msg.channel.messages.fetch({ limit: 100 });

		for (let i = 0; i < 6; i++) {
			const fetchedMessages = await msg.channel.messages.fetch({ limit: 100, before: messageBank.last().id });
			messageBank = messageBank.concat(fetchedMessages);
		}

		for (let i = 0; i < messageBank.size; i++) {
			const message = messageBank.random();
			if (message.author.bot) continue;
			if (message.content.replace(/\W/g, '').replace(/[0-9]/g, '').length < 20) continue;

			const embed = new MessageEmbed()
				.setDescription(message.content)
				.setAuthor(message.author.username, message.author.avatarURL());
			return msg.send({ embed });
		}
		return msg.send(`Couldn't find a quote.`);
	}

};
