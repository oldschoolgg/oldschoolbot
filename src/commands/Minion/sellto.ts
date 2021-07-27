import { GuildMember } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji, Events } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			usage: '<member:member> [price:int{1,100000000000}] (items:...TradeableBank)',
			usageDelim: ' ',
			oneAtTime: true,
			ironCantUse: true,
			categoryFlags: ['minion'],
			description: 'Sells items to other players for GP.',
			examples: ['+sellto @Magnaboy 1b 2 Elysian sigil', '+sellto @Magnaboy 500k 1 Dragon platelegs']
		});
	}

	async run(
		msg: KlasaMessage,
		[buyerMember, price, [bankToSell, totalPrice]]: [GuildMember, number, [Bank, number]]
	) {
		if (!price) {
			price = 1;
		}

		// Make sure blacklisted members can't be traded.
		const isBlacklisted = this.client.settings.get(ClientSettings.UserBlacklist).includes(buyerMember.user.id);
		if (isBlacklisted) throw "Blacklisted players can't buy items.";
		if (msg.author.isIronman) throw "Iron players can't sell items.";
		if (buyerMember.user.isIronman) throw "Iron players can't be sold items.";
		if (buyerMember.user.id === msg.author.id) throw "You can't trade yourself.";
		if (buyerMember.user.bot) throw "You can't trade a bot.";
		if (buyerMember.user.isBusy) {
			throw 'That user is busy right now.';
		}

		await Promise.all([buyerMember.user.settings.sync(true), msg.author.settings.sync(true)]);

		if (buyerMember.user.settings.get(UserSettings.GP) < price) {
			throw "That user doesn't have enough GP :(";
		}

		buyerMember.user.toggleBusy(true);
		msg.author.toggleBusy(true);
		try {
			await this.sell(msg, buyerMember, price, [bankToSell, totalPrice]);
		} finally {
			buyerMember.user.toggleBusy(false);
			msg.author.toggleBusy(false);
		}
	}

	async sell(msg: KlasaMessage, buyerMember: GuildMember, price: number, [bankToSell, totalPrice]: [Bank, number]) {
		const bankStr = bankToSell.toString();

		let sellStr = `${msg.author}, please confirm that you want to sell ${bankStr} to \`${
			buyerMember.user.username
		}#${buyerMember.user.discriminator}\` for a *total* of ${price.toLocaleString()} GP.`;

		const botPays = Math.floor(totalPrice) * 0.8;

		if (botPays > price) {
			sellStr += `\n\nWarning: The bot would pay you more (${botPays.toLocaleString()} GP) for these items than you are selling them for!`;
		}

		sellStr += `\n\n${buyerMember.user}, please confirm that you want to buy the items described above from \`${msg.author.username}#${msg.author.discriminator}\`.`;

		const message = await msg.groupConfirm({
			users: [msg.author, buyerMember.user],
			str: sellStr,
			type: ['Accept', 'Accepted'],
			errorStr: 'Trade canceled. Everyone must accept it.'
		});

		try {
			if (buyerMember.user.settings.get(UserSettings.GP) < price || !msg.author.bank().fits(bankToSell)) {
				return message.edit(
					`${message.content}\n\nOne of you lacks the required GP or items to make this trade.`
				);
			}

			await buyerMember.user.removeGP(price);
			await msg.author.addGP(price);

			await msg.author.removeItemsFromBank(bankToSell.bank);
			await buyerMember.user.addItemsToBank(bankToSell.bank);
		} catch (err) {
			this.client.emit(Events.Wtf, err);
			return message.edit(
				`${message.content}\n\n**${Emoji.Warning} -- Fatal error occurred. Please seek help in the support server.**`
			);
		}

		this.client.emit(
			Events.EconomyLog,
			`${msg.author.sanitizedName} sold ${bankStr} to ${
				buyerMember.user.sanitizedName
			} for ${price.toLocaleString()} GP.`
		);

		msg.author.log(`sold ${bankStr} to ${buyerMember.user.sanitizedName} for ${price}`);

		return message.edit(
			`${message.content}\n\n${Emoji.Tick} -- **Sale of ${bankStr} for ${price.toLocaleString()} GP complete!**`
		);
	}
}
