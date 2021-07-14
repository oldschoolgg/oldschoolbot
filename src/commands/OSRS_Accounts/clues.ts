import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';

import { BotCommand } from '../../lib/structures/BotCommand';
import { toTitleCase } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			description: 'Shows the Clue Highscores of an account.',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS'],
			categoryFlags: ['utility']
		});
	}

	async run(msg: KlasaMessage, [username]: [string]) {
		try {
			const { clues } = await Hiscores.fetch(username);

			const embed = new MessageEmbed()
				.setAuthor(username)
				.setColor(52_224)
				.setThumbnail('https://i.imgur.com/azW3cSB.png');

			for (const tier of Object.keys(clues) as (keyof typeof clues)[]) {
				embed.addField(
					toTitleCase(tier),
					`**Rank:** ${clues[tier].rank.toLocaleString()}\n**Score:** ${clues[
						tier
					].score.toLocaleString()}\n`,
					true
				);
			}

			return msg.channel.send({ embeds: [embed] });
		} catch (err) {
			return msg.channel.send(err.message);
		}
	}
}
