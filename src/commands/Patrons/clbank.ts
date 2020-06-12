import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { PerkTier } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			perkTier: PerkTier.Two
		});
	}

	async run(msg: KlasaMessage) {
		return msg.channel.sendBankImage({
			bank: msg.author.settings.get(UserSettings.CollectionLogBank),
			title: `${msg.author.username}'s Entire Collection Log`
		});
	}
}
