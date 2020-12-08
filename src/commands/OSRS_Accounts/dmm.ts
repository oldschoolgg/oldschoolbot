import { CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';
import { AccountType } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			description: 'Shows the stats of a DMM account.',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS'],
			examples: ['+dmm d3adscene'],
			categoryFlags: ['utility']
		});
	}

	async run(msg: KlasaMessage, [username]: [string]) {
		try {
			const player = await Hiscores.fetch(username, { type: AccountType.Deadman });
			const embed = this.getStatsEmbed(username, 11995146, player);
			return msg.send({ embed });
		} catch (err) {
			return msg.send(err.message);
		}
	}
}
