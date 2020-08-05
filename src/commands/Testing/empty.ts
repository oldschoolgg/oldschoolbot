import { KlasaMessage, CommandStore } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['clear', 'emptybank'],
			usage: ''
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

		await msg.author.removeGP(msg.author.settings.get(UserSettings.GP));
		for (const [itemID, qty] of Object.entries(msg.author.settings.get(UserSettings.Bank))) {
			await msg.author.removeItemFromBank(parseInt(itemID), qty);
		}
	}
}
