import { CommandStore, KlasaMessage } from 'klasa';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			testingCommand: true
		});
		this.enabled = !this.client.production;
	}

	async run(msg: KlasaMessage) {
		if (msg.flagArgs.bank) {
			await msg.author.settings.reset(UserSettings.Bank);
			return msg.channel.send('Reset your bank.');
		}
		await msg.confirm('Are you sure you want to reset all your settings/data?');
		await msg.author.settings.reset();
		await msg.author.settings.update('minion.hasBought', true);
		return msg.channel.send('Resetteded all your data.');
	}
}
