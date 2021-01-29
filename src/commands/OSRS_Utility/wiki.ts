import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Wiki } from 'oldschooljs';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			oneAtTime: true,
			aliases: ['w'],
			description: 'Search the OSRS Wikipedia for an article.',
			examples: ['+wiki tbow'],
			usage: '[query:str]',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg: KlasaMessage, [query]: [string | undefined]) {
		if (!query) {
			return msg.send('https://oldschool.runescape.wiki');
		}

		const result = await Wiki.search(query);

		if (result.length === 0) {
			return msg.send(`Found no results with that query.`);
		}

		const [page, ...tail] = result;

		const embed = new MessageEmbed()
			.setColor(52224)
			.setURL(page.url)
			.setTitle(page.title)
			.setDescription(
				`${page.extract}

**Related:**
${tail
	.slice(0, 5)
	.map(pg => `[${pg.title}](${pg.url})`)
	.join(', ')}`
			)
			.setFooter('Old School RuneScape Wiki');

		if (page.image) {
			embed.setThumbnail(page.image);
		}

		return msg.send({ embed });
	}
}
