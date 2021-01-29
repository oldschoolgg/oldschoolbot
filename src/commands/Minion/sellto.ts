import { GuildMember } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Events } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';

const options = {
	max: 1,
	time: 20000,
	errors: ['time']
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			usage: '<member:member> <price:int{1,100000000000}> (items:...TradeableBank)',
			usageDelim: ' ',
			oneAtTime: true,
			ironCantUse: true,
			categoryFlags: ['minion'],
			description: 'Sells items to other players for GP.',
			examples: [
				'+sellto @Magnaboy 1b 2 Elysian sigil',
				'+sellto @Magnaboy 500k 1 Dragon platelegs'
			]
		});
	}

	async run(
		msg: KlasaMessage,
		[buyerMember, price, [bankToSell, totalPrice]]: [GuildMember, number, [Bank, number]]
	) {
		// Make sure blacklisted members can't be traded.
		const isBlacklisted = this.client.settings
			.get(ClientSettings.UserBlacklist)
			.includes(buyerMember.user.id);
		if (isBlacklisted) throw `Blacklisted players can't buy items.`;
		if (msg.author.isIronman) throw `Iron players can't sell items.`;
		if (buyerMember.user.isIronman) throw `Iron players can't be sold items.`;
		if (buyerMember.user.id === msg.author.id) throw `You can't trade yourself.`;
		if (buyerMember.user.bot) throw `You can't trade a bot.`;
		if (buyerMember.user.isBusy) {
			throw `That user is busy right now.`;
		}

		await Promise.all([buyerMember.user.settings.sync(true), msg.author.settings.sync(true)]);

		if (buyerMember.user.settings.get(UserSettings.GP) < price) {
			throw `That user doesn't have enough GP :(`;
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

	async sell(
		msg: KlasaMessage,
		buyerMember: GuildMember,
		price: number,
		[bankToSell, totalPrice]: [Bank, number]
	) {
		const bankStr = bankToSell.toString();

		let sellStr = `${
			msg.author
		}, say \`confirm\` to confirm that you want to sell ${bankStr} to \`${
			buyerMember.user.username
		}#${buyerMember.user.discriminator}\` for a *total* of ${price.toLocaleString()} GP.`;

		const botPays = Math.floor(totalPrice) * 0.8;

		if (botPays > price) {
			sellStr += `\n\nWarning: The bot would pay you more (${botPays.toLocaleString()} GP) for these items than you are selling them for!`;
		}

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const sellMsg = await msg.channel.send(sellStr);

			// Confirm the seller wants to sell
			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					options
				);
			} catch (err) {
				return sellMsg.edit(`Cancelling sale of ${bankToSell}.`);
			}
		}

		// Confirm the buyer wants to buy
		const buyerConfirmationMsg = await msg.channel.send(
			`${buyerMember}, do you wish to buy ${bankStr} from \`${msg.author.username}#${
				msg.author.discriminator
			}\` for ${price.toLocaleString()} GP? Say \`buy\` to confirm.`
		);

		try {
			await msg.channel.awaitMessages(
				_msg =>
					_msg.author.id === buyerMember.user.id && _msg.content.toLowerCase() === 'buy',
				options
			);
		} catch (err) {
			buyerConfirmationMsg.edit(`Cancelling sale of ${bankStr}.`);
			return msg.channel.send(`Cancelling sale of ${bankStr}.`);
		}

		try {
			if (buyerMember.user.settings.get(UserSettings.GP) < price) {
				return msg.send(`One of you lacks the required GP or items to make this trade.`);
			}

			await buyerMember.user.removeGP(price);
			await msg.author.addGP(price);

			await msg.author.removeItemsFromBank(bankToSell.bank);
			await buyerMember.user.addItemsToBank(bankToSell.bank);
		} catch (err) {
			this.client.emit(Events.Wtf, err);
			return msg.send(`Fatal error occurred. Please seek help in the support server.`);
		}

		this.client.emit(
			Events.EconomyLog,
			`${msg.author.sanitizedName} sold ${bankStr} to ${
				buyerMember.user.sanitizedName
			} for ${price.toLocaleString()} GP.`
		);

		msg.author.log(`sold ${bankStr} to ${buyerMember.user.sanitizedName} for ${price}`);

		return msg.send(`Sale of ${bankStr} complete!`);
	}
}
