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
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage) {
		// Make 100% sure this command can never be used in prod
		if (
			this.client.production ||
			!this.client.user ||
			this.client.user.id === '303730326692429825'
		) {
			return;
		}

		if (!msg.flagArgs.bank) {
			await msg.author.settings.reset();
			await msg.author.settings.update(UserSettings.Minion.HasBought, true);
		} else {
			await msg.author.settings.update([
				[UserSettings.Bank, {}],
				[UserSettings.CollectionLogBank, {}],
				[UserSettings.GP, 0]
			]);
		}

		return msg.send(
			`${
				!msg.flagArgs.bank
					? 'Your minion is reset! You can use --bank to clear only your bank!'
					: 'You cleared your bank!'
			}`
		);
	}
}
