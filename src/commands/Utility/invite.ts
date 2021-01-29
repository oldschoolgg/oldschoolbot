import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Displays the invite link for the bot.',
			examples: ['+invite'],
			categoryFlags: ['utility']
		});
	}

	async run(msg: KlasaMessage) {
		return msg.send(
			`You can invite the bot to your server using this link: <https://invite.oldschool.gg/>`
		);
	}
}
