import { CommandStore, KlasaMessage } from 'klasa';

import { PerkTier } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			perkTier: PerkTier.Four
		});
	}

	async run(msg: KlasaMessage) {
		return msg.channel.sendBankImage({
			bank: this.client.settings.get(ClientSettings.BankLottery)
		});
	}
}
