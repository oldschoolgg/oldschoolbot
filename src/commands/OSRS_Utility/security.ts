import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows some information on securing your runescape account.',
			examples: ['+security']
		});
	}

	async run(msg: KlasaMessage) {
		return msg.send(`
View the official account security guidelines by Jagex here: <https://www.runescape.com/oldschool/security>

1. **Setup Authenticator (2FA) on your account.**
2. Never tell anyone your password or bank pin for any reason.
3. Secure your computer by installing an anti-virus software.
4. Secure your E-Mail account by adding 2-Factor-Authentication.
5. Add a Bank pin to your account. (Speak to a banker ingame)
6. Never attempt to use any bots or cheats.
7. Never click on Twitch streams which claim that someone is quitting, or double XP. *They're fake.*
`);
	}
}
