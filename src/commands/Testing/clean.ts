import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			oneAtTime: true,
			aliases: ['clear']
		});
		// this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage) {
		// Make 100% sure this command can never be used in prod
		if (
			this.client.production ||
			!this.client.user ||
			this.client.user.id === '156230339621027840'
		) {
			return msg.send(`NOOO`);
		}

		msg.author.settings.reset();
		await msg.author.settings.update(UserSettings.GP, 0);
		await msg.author.settings.update(UserSettings.Minion.HasBought, true);

		return msg.send(`Your minion is reset!`);
	}
}
