import { CommandStore, KlasaMessage } from 'klasa';
import { Hiscores } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
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
			return msg.send(`${username}'s Combat Level is **${player.combatLevel}**.`);
		} catch (err) {
			return msg.send(err.message);
		}
	}
}
