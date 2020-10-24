import { MessageEmbed } from 'discord.js';
import { Command, CommandStore, KlasaMessage, RichDisplay } from 'klasa';
import Parser from 'rss-parser';

const parser = new Parser();

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 30,
			description: 'Shows the latest OSRS News Posts.',
			requiredPermissions: ['MANAGE_MESSAGES', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY']
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
