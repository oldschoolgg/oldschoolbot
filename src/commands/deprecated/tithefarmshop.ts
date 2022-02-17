import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['tfs', 'tfshop']
		});
	}

	async run(msg: KlasaMessage) {
		return msg.channel.send(`This command you're trying to use, has been changed to a 'slash command'.

- Slash commands are integrated into the actual Discord client. We are *required* to change our commands to be slash commands.
- Slash commands are generally easier to use, and also have new features like autocompletion. They take some time to get used too though.
- You no longer use this command using \`${msg.cmdPrefix}${msg.command?.name}\`, now you use: \`/tithefarm buy\``);
	}
}
