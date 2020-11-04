import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows some informational links relating to the bot.',
			examples: ['+info']
		});
	}

	async run(msg: KlasaMessage) {
		return msg.send(`Old School Bot is an open-source Discord Bot based on Old School RuneScape.

	- Website: https://www.oldschool.gg/oldschoolbot/

	- Bot Invite Link: <https://invite.oldschool.gg/>

	- If you have any other enquiries, join the support server!

	- Support Server: discord.gg/ob`);
	}
}
