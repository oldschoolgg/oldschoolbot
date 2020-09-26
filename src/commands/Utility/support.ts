import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows the support link for the bot.'
		});
	}

	async run(msg: KlasaMessage) {
		return msg.send(`Support Server: http://support.oldschool.gg`);
	}
}
