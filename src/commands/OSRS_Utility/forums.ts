import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows the link for the official OSRS forum.',
			aliases: ['forum'],
			examples: ['+forums']
		});
	}

	async run(msg: KlasaMessage) {
		return msg.send('http://services.runescape.com/m=forum/forums.ws#group63');
	}
}
