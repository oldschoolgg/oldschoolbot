import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { PerkTier } from '../../lib/constants';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['ebank'],
			perkTier: PerkTier.Six,
			oneAtTime: true,
			cooldown: 60 * 60 * 3
		});
	}

	async run(msg: KlasaMessage) {
		const totalBank: { [key: string]: number } = {};

		const res: any = await this.client.query(
			msg.flagArgs.im
				? `SELECT ARRAY(SELECT bank FROM users WHERE bank::text <> '{}'::text AND "minion.ironman" = true);`
				: `SELECT ARRAY(SELECT bank FROM users WHERE bank::text <> '{}'::text);`
		);

		const banks = res[0].array;

		for (let i = 0; i < banks.length; i++) {
			for (const [id, qty] of Object.entries(banks[i]) as [string, number][]) {
				if (!totalBank[id]) totalBank[id] = qty;
				else totalBank[id] += qty;
			}
		}

		return msg.channel.sendBankImage({ bank: totalBank, title: `Entire Economy Bank` });
	}
}
