import { GuildMember } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Events } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { itemNameFromID } from '../../lib/util';
import itemIsTradeable from '../../lib/util/itemIsTradeable';
import { logError } from '../../lib/util/logError';
import { parseInputBankWithPrice } from '../../lib/util/parseStringBank';

const options = {
	max: 1,
	time: 20_000,
	errors: ['time']
};

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
			flags: { ...msg.flagArgs, tradeables: 'tradeables' },
			excludeItems: [],
			user: msg.author
		});
		if (bankToSell.items().some(i => !itemIsTradeable(i[0].id))) {
			logError(new Error('Trying to sell untradeable item'), {
				userID: msg.author.id,
				inputItems: strBankWithPrice ?? '',
				resultItems: bankToSell.toString()
			});
			return msg.channel.send('You are trying to sell untradeable items.');
		}
		if (bankToSell.length === 0) {
			return msg.channel.send('No valid tradeable items that you own were given.');
		}

		let favoritedItemsBeingSold = msg.author.settings
			.get(UserSettings.FavoriteItems)
			.filter(i => bankToSell.has(i));
		if (favoritedItemsBeingSold.length > 0) {
			const isConfirming = Boolean(msg.flagArgs.cf) || Boolean(msg.flagArgs.confirm);
			delete msg.flagArgs.cf;
			delete msg.flagArgs.confirm;
			await msg.confirm(
				`You're trying to sell favorited items (${favoritedItemsBeingSold
					.map(itemNameFromID)
					.join(', ')}), are you sure you want to do that?`
			);
			if (isConfirming) {
				msg.flagArgs.confirm = 'confirm';
			}
		}

		if (price < 0 || price > 100_000_000_000) {
			return msg.channel.send('Invalid price.');
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
			await this.sell(msg, buyerMember, price, bankToSell);
		} finally {
			buyerMember.user.toggleBusy(false);
			msg.author.toggleBusy(false);
		}
	}

	async sell(msg: KlasaMessage, buyerMember: GuildMember, price: number, bankToSell: Bank) {
		const bankStr = bankToSell.toString();

		let sellStr = `${msg.author}, please confirm that you want to sell ${bankStr} to \`${
			buyerMember.user.username
		}#${buyerMember.user.discriminator}\` for a *total* of ${price.toLocaleString()} GP.`;

		const botPays = Math.floor(bankToSell.value()) * 0.8;

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
			if (price > 0) {
				await buyerMember.user.removeItemsFromBank(new Bank().add('Coins', price));
				await msg.author.addItemsToBank({ items: new Bank().add('Coins', price), collectionLog: false });
			}

			await msg.author.removeItemsFromBank(bankToSell.bank);
			await buyerMember.user.addItemsToBank({ items: bankToSell, collectionLog: false, filterLoot: false });
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
