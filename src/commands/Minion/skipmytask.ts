import { KlasaMessage, CommandStore } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/UserSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '',
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage) {
		await msg.author.settings.update(UserSettings.Slayer.HasSlayerTask, false);
		return msg.send(`You no longer have a slayer task`);
	}
}
