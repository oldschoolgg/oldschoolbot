import { CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';
import { AccountType } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			aliases: [],
			description: 'Shows the stats of a UIM account.',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS'],
			categoryFlags: ['utility'],
			examples: ['+uim Lajnux']
		});
	}

	async run(msg: KlasaMessage, [username]: [string]) {
		try {
			const player = await Hiscores.fetch(username, { type: AccountType.Ultimate });
			return msg.channel.send({ embeds: [this.getStatsEmbed(username, 5_460_819, player)] });
		} catch (err) {
			return msg.channel.send(err.message);
		}
	}
}
