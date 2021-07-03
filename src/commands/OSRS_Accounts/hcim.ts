import { CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';
import { AccountType } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			aliases: ['hc'],
			description: 'Shows the stats of a HCIM account.',
			usage: '(username:rsn)',
			requiredPermissions: ['EMBED_LINKS'],
			examples: ['+hcim Faux'],
			categoryFlags: ['utility']
		});
	}

	async run(msg: KlasaMessage, [username]: [string]) {
		try {
			const player = await Hiscores.fetch(username, { type: AccountType.Hardcore });
			return msg.channel.send({ embeds: [this.getStatsEmbed(username, 11995146, player)] });
		} catch (err) {
			return msg.channel.send(err.message);
		}
	}
}
