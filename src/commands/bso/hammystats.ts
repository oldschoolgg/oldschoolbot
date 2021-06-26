import { CommandStore, KlasaMessage } from 'klasa';

import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ItemBank } from '../../lib/types';
import { countAllItemsInBank } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[statsType:string]',
			usageDelim: ',',
			oneAtTime: true,
			cooldown: 15,
			altProtection: true
		});
	}

	async run(msg: KlasaMessage, [statsType]: [string]) {
		if (msg.flagArgs.help || statsType === 'help') {
			return msg.send(
				'Usage:\n\n' +
					`\`${msg.cmdPrefix}hammystats [overall/destroyed/doubled/spared]\` Show Hammy's economy stats`
			);
		}

		if (statsType === 'destroyed') {
			return msg.channel.sendBankImage({
				bank: this.client.settings.get(ClientSettings.EconomyStats.HammyDestroyed),
				title: 'All items Hammys have destroyed:',
				flags: msg.flagArgs
			});
		}
		if (statsType === 'doubled') {
			return msg.channel.sendBankImage({
				bank: this.client.settings.get(ClientSettings.EconomyStats.HammyDoubled),
				title: 'All items Hammys have doubled:',
				flags: msg.flagArgs
			});
		}
		if (statsType === 'spared') {
			return msg.channel.sendBankImage({
				bank: this.client.settings.get(ClientSettings.EconomyStats.HammySpared),
				title: 'All items Hammys have spared:',
				flags: msg.flagArgs
			});
		}

		const ctDestroyed = countAllItemsInBank(
			this.client.settings.get(ClientSettings.EconomyStats.HammyDestroyed) as ItemBank
		);
		const ctDoubled = countAllItemsInBank(
			this.client.settings.get(ClientSettings.EconomyStats.HammyDoubled) as ItemBank
		);
		const ctSpared = countAllItemsInBank(
			this.client.settings.get(ClientSettings.EconomyStats.HammySpared) as ItemBank
		);

		return msg.send(
			'Overall Hammy economy stats:\n\n' +
				`Total items destroyed: ${ctDestroyed}\n` +
				`Total items doubled: ${ctDoubled}\n` +
				`Total items spared: ${ctSpared}`
		);
	}
}
