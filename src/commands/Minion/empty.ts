import { KlasaMessage, CommandStore } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['clear', 'emptybank'],
			usage: ''
		});
	}

	async run(msg: KlasaMessage) {
		await msg.author.removeGP(msg.author.settings.get(UserSettings.GP));
		for (const [itemID, qty] of Object.entries(msg.author.settings.get(UserSettings.Bank))) {
			await msg.author.removeItemFromBank(parseInt(itemID), qty);
		}
	}
}