import { CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';
import { AccountType } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/structures/BotCommand';
import { statsEmbed } from '../../lib/util/statsEmbed';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: [],
			description: 'Shows the stats of a UIM account.',
			usage: '(username:rsn)',
			requiredPermissionsForBot: ['EMBED_LINKS'],
			categoryFlags: ['utility'],
			examples: ['+uim Lajnux']
		});
	}

	async run(msg: KlasaMessage, [username]: [string]) {
		try {
			const player = await Hiscores.fetch(username, { type: AccountType.Ultimate });
			return msg.channel.send({ embeds: [statsEmbed({ username, color: 5_460_819, player })] });
		} catch (err: any) {
			return msg.channel.send(err.message);
		}
	}
}
