import { CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';

import { BotCommand } from '../../lib/structures/BotCommand';
import { statsEmbed } from '../../lib/util/statsEmbed';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows your XP in all skills.',
			usage: '(username:rsn)',
			requiredPermissionsForBot: ['EMBED_LINKS'],
			examples: ['+xp Magnaby'],
			categoryFlags: ['utility']
		});
	}

	async run(msg: KlasaMessage, [username]: [string]) {
		try {
			const player = await Hiscores.fetch(username);
			return msg.channel.send({
				embeds: [statsEmbed({ username, color: 7_981_338, player, key: 'xp', showExtra: false })]
			});
		} catch (err: any) {
			return msg.channel.send(err.message);
		}
	}
}
