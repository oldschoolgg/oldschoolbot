import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, RichDisplay } from 'klasa';
import Parser from 'rss-parser';

import { BotCommand } from '../../lib/structures/BotCommand';

const parser = new Parser();

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 30,
			description: 'Shows the latest OSRS News Posts.',
			requiredPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
			examples: ['+news']
		});
	}

	async run(msg: KlasaMessage) {
		const [message, feed] = await Promise.all([
			msg.send('Loading...'),
			parser.parseURL('http://services.runescape.com/m=news/latest_news.rss?oldschool=true')
		]);
		const display = new RichDisplay();
		display.setFooterPrefix(`Page `);

		for (const item of feed.items as any) {
			display.addPage(
				new MessageEmbed()
					.setTitle(item.title)
					.setDescription(item.contentSnippet)
					.setColor(52224)
					.setThumbnail(item.enclosure.url)
					.setURL(item.guid)
			);
		}

		display.run(message, { jump: false, stop: false });
		return null;
	}
}
