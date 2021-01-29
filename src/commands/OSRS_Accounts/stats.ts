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
			const embed = this.getStatsEmbed(username, 7981338, player);
			return msg.send({ embed });
		} catch (err) {
			return msg.send(err.message);
		}
	}
}
