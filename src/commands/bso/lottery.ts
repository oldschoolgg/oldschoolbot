import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { PerkTier } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { addArrayOfNumbers, toKMB } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			perkTier: PerkTier.Four
		});
	}

	async run(msg: KlasaMessage) {
		const tickets = addArrayOfNumbers(
			await this.client
				.query<{ qty: number }[]>(
					`SELECT id, CAST(bank->>'5020' AS INTEGER) as qty FROM users WHERE bank->>'5020' IS NOT NULL; `
				)
				.then(res => res.map(i => i.qty))
		);

		const gp = tickets * 50_000_000;

		return msg.channel.sendBankImage({
			bank: this.client.settings.get(ClientSettings.BankLottery),
			content: `**GP Lottery:** ${toKMB(gp)}\n**Bank Lottery:**`
		});
	}
}
