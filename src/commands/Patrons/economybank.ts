import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { PerkTier, Time } from '../../lib/constants';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['ebank'],
			perkTier: PerkTier.Six,
			oneAtTime: true,
			cooldown: 180 * Time.Minute
		});
	}

	async run(msg: KlasaMessage) {
		const banks: { [key: string]: number } = {};
		let lastID = 0;
		while (true) {
			const res = (await this.client.query(
				msg.flagArgs.im
					? `SELECT id, bank FROM users WHERE id::BIGINT > ${lastID} AND "minion.ironman" = true order BY id::bigint asc limit 5000;`
					: `SELECT id, bank FROM users WHERE id::BIGINT > ${lastID} order BY id::bigint asc limit 5000;`
			)) as any[];
			if (res.length === 0) {
				break;
			}
			res.forEach(data => {
				lastID = data.id;
				Object.entries(data.bank).forEach((i: any) => {
					banks[i[0]] = (banks[i[0]] ?? 0) + Number(i[1]);
				});
			});
		}
		return msg.channel.sendBankImage({ bank: banks, title: `Entire Economy Bank` });
	}
}
