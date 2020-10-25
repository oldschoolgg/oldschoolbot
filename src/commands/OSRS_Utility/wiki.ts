import { MessageEmbed } from 'discord.js';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { Wiki } from 'oldschooljs';

export default class extends Command {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			aliases: ['w'],
			description: 'Search the OSRS Wikipedia for an article.',
			usage: '[query:str]',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg: KlasaMessage, [query]: [string | undefined]) {
		if (!query) {
			return msg.send('https://oldschool.runescape.wiki');
		}

		const [page, ...tail] = await Wiki.search(query);

		const embed = new MessageEmbed()
			.setColor(52224)
			.setURL(page.url)
			.setTitle(page.title)
			.setDescription(
				`${page.extract}

${tail.map(pg => `[${pg.title}](${pg.url})`)}
`
			)
			.setFooter('Old School RuneScape Wiki');

		if (page.image) {
			embed.setThumbnail(page.image);
		}

		return msg.send({ embed });
	}
}
