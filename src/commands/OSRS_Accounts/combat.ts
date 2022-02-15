import { CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['cb'],
			description: 'Shows the Combat level for an OSRS account.',
			usage: '(username:rsn)',
			categoryFlags: ['utility'],
			examples: ['+cb mylife212', '+cb Woox']
		});
	}

	async run(msg: KlasaMessage, [username]: [string]) {
		try {
			const player = await Hiscores.fetch(username);
			return msg.channel.send(`${username}'s Combat Level is **${player.combatLevel}**.`);
		} catch (err: any) {
			return msg.channel.send(err.message);
		}
	}
}
