import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/UserSettings';
import { formatDuration } from '../../util';
import { Time } from '../../lib/constants';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage) {
		if (typeof msg.author.settings.get(UserSettings.CurrentTime) === 'undefined') {
			return msg.send(`Go bankstand first`);
		}
		const newtime = msg.author.settings.get(UserSettings.CurrentTime);
		return msg.send(
			`You have wasted ${formatDuration(newtime * Time.Minute)} of your life bank standing.`
		);
	}
}
