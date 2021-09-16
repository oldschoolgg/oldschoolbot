import { GuildMember } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Events } from '../../lib/constants';
import { evalMathExpression } from '../../lib/expressionParser';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

const options = {
	max: 1,
	time: 20_000,
	errors: ['time']
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			usage: '<member:member> [price:string] (items:...TradeableBank)',
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
		[buyerMember, rawPrice, [bankToSell, totalPrice]]: [GuildMember, string, [Bank, number]]
	) {
		if (!rawPrice) {
			rawPrice = '1';
		}
		if (bankToSell.length === 1) {
			const item = bankToSell.items()[0];
			rawPrice = rawPrice.replace('#', bankToSell.amount(item[0].id).toString());
		}
		let price = evalMathExpression(rawPrice ?? '1') ?? 1;

		// If the each flag is set, multiply the value for each of the items being sold
		if (msg.flagArgs.each) {
			price *= bankToSell
				.items()
				.map(i => i[1])
				.reduce((a, b) => a + b);
		}

		if (price < 1 || price > 100_000_000_000) {
			return msg.channel.send(
				`Invalid price. ${
					price > 100_000_000_000
						? "Total price of trade can't be over 100b."
						: "The price of the trade can't be lower than 1."
				}`
			);
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

		await msg.confirm(sellStr);

		// Confirm the buyer wants to buy
		const buyerConfirmationMsg = await msg.channel.send(
			`${buyerMember}, do you wish to buy ${bankStr} from \`${msg.author.username}#${
				msg.author.discriminator
			}\` for ${price.toLocaleString()} GP? Say \`buy\` to confirm.`
		);

		try {
			await msg.channel.awaitMessages({
				...options,
				filter: _msg => _msg.author.id === buyerMember.user.id && _msg.content.toLowerCase() === 'buy'
			});
		} catch (err) {
			buyerConfirmationMsg.edit(`Cancelling sale of ${bankStr}.`);
			return msg.channel.send(`Cancelling sale of ${bankStr}.`);
		}

		try {
			if (buyerMember.user.settings.get(UserSettings.GP) < price || !msg.author.bank().fits(bankToSell)) {
				return msg.channel.send('One of you lacks the required GP or items to make this trade.');
			}

			await buyerMember.user.removeGP(price);
			await msg.author.addGP(price);

			await msg.author.removeItemsFromBank(bankToSell.bank);
			await buyerMember.user.addItemsToBank(bankToSell.bank, false, false);
		} catch (err) {
			this.client.emit(Events.Wtf, err);
			return msg.channel.send('Fatal error occurred. Please seek help in the support server.');
		}

		this.client.emit(
			Events.EconomyLog,
			`${msg.author.sanitizedName} sold ${bankStr} to ${
				buyerMember.user.sanitizedName
			} for ${price.toLocaleString()} GP.`
		);

		msg.author.log(`sold ${bankStr} to ${buyerMember.user.sanitizedName} for ${price}`);

		return msg.channel.send(`Sale of ${bankStr} complete!`);
	}
}
