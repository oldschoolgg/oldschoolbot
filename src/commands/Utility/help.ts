import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows the link to the help page for old school bot',
			examples: ['+help']
		});
	}

	async run(msg: KlasaMessage) {
		return msg.send(`https://www.oldschool.gg/oldschoolbot`);
	}
}
