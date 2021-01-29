import { CommandStore, KlasaMessage } from 'klasa';

import { Emoji } from '../../lib/constants';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['donate', 'patron'],
			examples: ['+patreon'],
			description: 'Displays the link to the patreon.',
			categoryFlags: ['utility']
		});
	}

	async run(msg: KlasaMessage) {
		return msg.send(
			`You can become a patron to support me or thank me if you're enjoying the bot, and receive some perks: <https://www.patreon.com/oldschoolbot> ${Emoji.PeepoOSBot}`
		);
	}
}
