import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import Parser from 'rss-parser';

import { BotCommand } from '../../lib/structures/BotCommand';
import { makePaginatedMessage } from '../../lib/util';

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
		const feed = await parser.parseURL('http://services.runescape.com/m=news/latest_news.rss?oldschool=true');

		const pages = [];
		for (const item of feed.items as any) {
			pages.push({
				embeds: [
					new MessageEmbed()
						.setTitle(item.title)
						.setDescription(item.contentSnippet)
						.setColor(52_224)
						.setThumbnail(item.enclosure.url)
						.setURL(item.guid)
				]
			});
		}

		await makePaginatedMessage(msg, pages);
		return null;
	}
}
