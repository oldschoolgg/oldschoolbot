import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { PerkTier } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['sbank'],
			perkTier: PerkTier.Two,
			oneAtTime: true,
			cooldown: 60 * 10,
			description: 'Shows a huge bank containing all items ever sacrificed.',
			examples: ['+sbank'],
			categoryFlags: ['patron', 'minion']
		});
	}

	async run(msg: KlasaMessage) {
		return msg.channel.sendBankImage({
			bank: this.client.settings.get(ClientSettings.EconomyStats.SacrificedBank),
			title: `Sacrificed Items Of All Players`,
			content: `Note: Approximately 130b worth of items are not shown, as they were sacrificed before items were starting to be tracked.`
		});
	}
}
