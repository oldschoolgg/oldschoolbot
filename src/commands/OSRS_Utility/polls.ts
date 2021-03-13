import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows the link for the OSRS Polls.',
			examples: ['+polls']
		});
	}

	async run(msg: KlasaMessage) {
		return msg.send('https://secure.runescape.com/m=poll/oldschool/');
	}
}
