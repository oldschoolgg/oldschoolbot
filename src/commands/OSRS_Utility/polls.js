const { Command, RichDisplay } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			description: 'Shows the link for the OSRS Polls.',
			requiredPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY']
		});
	}

	async run(msg) {
		try {
			const message = await msg.send('Loading...');
			const display = new RichDisplay();
			display.setFooterPrefix(`Page `);

			const { title, description, questions } = this.client.settings.get('pollQuestions');

			display.addPage(
				new MessageEmbed()
					.setTitle(title)
					.setColor(16098851)
					.setDescription(description)
			);

			for (const question of questions) {
				display.addPage(
					new MessageEmbed().setColor(16098851).setDescription(
						`**${question.question}**\n\n${Object.keys(question.votes)
							.map(key => `**${key}** - ${question.votes[key]}`)
							.join('\n')}`
					)
				);
			}

			return display.run(message, { jump: false, stop: false });
		} catch (err) {
			console.error(err);
		}
	}
};
