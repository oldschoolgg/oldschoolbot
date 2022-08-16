import { GuildMember } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { toKMB } from 'oldschooljs/dist/util';

import { BotCommand } from '../../lib/structures/BotCommand';
import { isSuperUntradeable } from '../../lib/util';
import { parseInputBankWithPrice } from '../../lib/util/parseStringBank';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			usage: '<member:member> [strBankWithPrice:...str]',
			usageDelim: ' ',
			ironCantUse: true,
			categoryFlags: ['minion'],
			description: 'Sells items to other players for GP.',
			examples: ['+sellto @Magnaboy 1b 2 Elysian sigil', '+sellto @Magnaboy 500k 1 Dragon platelegs']
		});
	}

	async run(msg: KlasaMessage, [buyerMember, strBankWithPrice]: [GuildMember, string | undefined]) {
		const { price, bank: bankToSell } = parseInputBankWithPrice({
			usersBank: msg.author.bank(),
			str: strBankWithPrice ?? '',
			flags: { ...msg.flagArgs },
			excludeItems: [],
			user: msg.author
		});
		bankToSell.filter(i => !isSuperUntradeable(i), true);

		if (bankToSell.length === 0) {
			return msg.channel.send('No valid tradeable items that you own were given.');
		}

		return msg.channel.send(
			`This command has been removed, in favour of \`/trade\`. To do this sale, use the trade command like this: \`/trade user:@${
				buyerMember.user.username
			} send:${bankToSell.items().map(i => `${i[1]} ${i[0].name}`)} receive:${toKMB(price)} Coins\`

Click here to open the trade command (desktop only): </trade:1005111197244334119>`
		);
	}
}
