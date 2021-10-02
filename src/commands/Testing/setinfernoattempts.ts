import { CommandStore, KlasaMessage } from 'klasa';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<kc:int{0,1000}>',
			usageDelim: ' ',
			testingCommand: true
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage, [kc]: [number]) {
		await msg.author.settings.update(UserSettings.InfernoAttempts, kc);

		return msg.channel.send(`Set your Inferno attempts to ${kc}.`);
	}
}
