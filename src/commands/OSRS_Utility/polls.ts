import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, RichDisplay } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows the link for the OSRS Polls.',
			examples: ['+polls'],
			requiredPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY']
		});
	}

	async run(msg: KlasaMessage) {
		try {
			const message = await msg.send('Loading...');
			const display = new RichDisplay();
			display.setFooterPrefix(`Page `);

			const { title, description, questions } = this.client.settings.get(
				ClientSettings.PollQuestions
			);

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
							.map(key => `**${key}** - ${(question.votes as any)[key]}`)
							.join('\n')}`
					)
				);
			}

			display.run(message, { jump: false, stop: false });
		} catch (err) {
			this.client.wtf(err);
		}
		return null;
	}
}
