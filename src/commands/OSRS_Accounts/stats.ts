import { CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			aliases: ['s'],
			description: 'Shows the stats of a OSRS account',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS'],
			examples: ['+s Magnaboy', '+s'],
			categoryFlags: ['utility']
		});
	}

	async run(msg: KlasaMessage, [username]: [string]) {
		try {
			const player = await Hiscores.fetch(username);
			return msg.channel.send({ embeds: [this.getStatsEmbed(username, 7981338, player)] });
		} catch (err) {
			return msg.channel.send(err.message);
		}
	}
}
