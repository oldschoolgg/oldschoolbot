import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows the github link for the bot.'
		});
	}

	async run(msg: KlasaMessage) {
		return msg.send(
			`<:OSBot:601768469905801226> Old School Bot is now open-source! <https://github.oldschool.gg/>`
		);
	}
}
