import { CommandStore, KlasaMessage } from 'klasa';

import { PerkTier } from '../../lib/constants';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ItemBank } from '../../lib/types';

const IGNORE_LESS_THEN = 0;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['ebank'],
			perkTier: PerkTier.Six,
			oneAtTime: true,
			cooldown: 60 * 60 * 3,
			description:
				'Shows a huge image containing everyones banks combined into one bank. Takes a while to complete.',
			examples: ['+ebank'],
			categoryFlags: ['patron', 'minion']
		});
	}

	async run(msg: KlasaMessage) {
		const query = `select
				jsonb_object_agg(itemID, itemQTY)::jsonb as banks
			 from (
				select key as itemID, sum(value::int) as itemQTY
				from users
				cross join jsonb_each_text(bank)
				${msg.flagArgs.im ? ` where users."minion.ironman" = true ` : ``}
				group by key
			 ) s where itemQTY >= ${IGNORE_LESS_THEN};`;
		const queryBank = await this.client.query<{ banks: ItemBank }[]>(query);
		return msg.channel.sendBankImage({
			bank: queryBank[0].banks,
			title: `Entire Economy Bank`
		});
	}
}
