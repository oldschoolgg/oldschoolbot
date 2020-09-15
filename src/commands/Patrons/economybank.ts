import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { PerkTier, Time } from '../../lib/constants';
import { ItemBank } from '../../lib/types';

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
		const query = `select
				json_object_agg(itemID, itemQTY)::jsonb as banks
			 from (
				select key as itemID, sum(value::int) as itemQTY
				from users
				cross join json_each_text(bank)
				${msg.flagArgs.im ? ` where users."minion.ironman" = true ` : ``}
				group by key
			 ) s`;
		const queryBank = await this.client.query<{ banks: ItemBank }[]>(query);
		return msg.channel.sendBankImage({
			bank: queryBank[0].banks,
			title: `Entire Economy Bank`
		});
	}
}
