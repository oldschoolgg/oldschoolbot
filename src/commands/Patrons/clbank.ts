import { CommandStore, KlasaMessage } from 'klasa';

import { PerkTier } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			perkTier: PerkTier.Two,
			oneAtTime: true,
			cooldown: 120,
			description:
				'Allows you to see your entire collection log, which is all items ever recorded in your collection log, viewed in the form of a bank.',
			examples: ['+clbank'],
			categoryFlags: ['patron', 'minion']
		});
	}

	async run(msg: KlasaMessage) {
		return msg.channel.sendBankImage({
			bank: msg.author.settings.get(UserSettings.CollectionLogBank),
			title: `${msg.author.username}'s Entire Collection Log`
		});
	}
}
