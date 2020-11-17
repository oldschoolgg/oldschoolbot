import { CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';
import { AccountType } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			aliases: ['league', 'leagues'],
			description: 'Shows the stats of a Seasonal leagues account.',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS'],
			categoryFlags: ['utility'],
			examples: ['+league Woox']
		});
	}

	async run(msg: KlasaMessage, [username]: [string]) {
		try {
			const player = await Hiscores.fetch(username, { type: AccountType.Seasonal });
			const embed = this.getStatsEmbed(username, 7981338, player);
			embed.setFooter(`Trailblazer Leagues`);
			return msg.send({ embed });
		} catch (err) {
			return msg.send(err.message);
		}
	}
}
