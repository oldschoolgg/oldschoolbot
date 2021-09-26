import { CommandStore, KlasaMessage } from 'klasa';

import { PerkTier } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['sbank'],
			perkTier: PerkTier.Two,
			oneAtTime: true,
			description: 'Shows a bank containing all your sacrificed items.',
			examples: ['+sbank'],
			categoryFlags: ['patron', 'minion']
		});
	}

	async run(msg: KlasaMessage) {
		return msg.channel.sendBankImage({
			bank: msg.author.settings.get(UserSettings.SacrificedBank),
			title: 'Your Sacrificed Items'
		});
	}
}
