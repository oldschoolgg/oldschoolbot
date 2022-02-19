import { CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';
import { AccountType } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/structures/BotCommand';
import { statsEmbed } from '../../lib/util/statsEmbed';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows the stats of a DMM account.',
			usage: '(username:rsn)',
			requiredPermissionsForBot: ['EMBED_LINKS'],
			examples: ['+dmm d3adscene'],
			categoryFlags: ['utility']
		});
	}

	async run(msg: KlasaMessage, [username]: [string]) {
		try {
			const player = await Hiscores.fetch(username, { type: AccountType.Tournament });
			return msg.channel.send({ embeds: [statsEmbed({ username, color: 11_995_146, player })] });
		} catch (err: any) {
			return msg.channel.send(err.message);
		}
	}
}
