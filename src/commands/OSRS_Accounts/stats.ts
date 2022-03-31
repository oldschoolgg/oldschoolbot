import { CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';

import { BotCommand } from '../../lib/structures/BotCommand';
import { statsEmbed } from '../../lib/util/statsEmbed';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['s'],
			description: 'Shows the stats of a OSRS account',
			usage: '(username:rsn)',
			requiredPermissionsForBot: ['EMBED_LINKS'],
			examples: ['+s Magnaboy', '+s'],
			categoryFlags: ['utility']
		});
	}

	async run(msg: KlasaMessage, [username]: [string]) {
		try {
			const player = await Hiscores.fetch(username);
			return msg.channel.send({
				content: 'You can now use this command as a slash command! Try it out using `/stats`',
				embeds: [statsEmbed({ username, color: 7_981_338, player })]
			});
		} catch (err: any) {
			return msg.channel.send(err.message);
		}
	}
}
