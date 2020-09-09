import { CommandStore, KlasaMessage } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import { GuildMember } from 'discord.js';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { ItemBank } from '../../lib/types';
import getOSItem from '../../lib/util/getOSItem';
import { addBanks, removeBankFromBank } from 'oldschooljs/dist/util';
import { ItemList } from '../../lib/minions/types';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { Util } from 'oldschooljs';
import { Events } from '../../lib/constants';
import { bankHasAllItemsFromBank } from '../../lib/util';

const options = {
	max: 1,
	time: 20000,
	errors: ['time']
};

/**
 * Returns an ItemBank from the items define on the string. Defaults to 1.
 * @example getItemsAndQuantityFromStringList('50 salmon, 50 manta ray, 20 salmon, cake, monkfish')
 * @param items
 * @return ItemBank[] The string in a ItemBank variable
 */
export async function getItemsAndQuantityFromStringList(items: string) {
	let bankItems: ItemBank = {};
	for (let item of items.split(',')) {
		item = item.trim();
		let [itemQty, ...itemNameArray] = item.split(' ');
		if (!Number(itemQty)) {
			itemNameArray.unshift(itemQty);
			itemQty = '';
		}
		const _item = getOSItem(itemNameArray.join(' '));
		bankItems = addBanks([
			{
				[_item.id]: Number(itemQty) ? parseInt(itemQty) : 1
			},
			bankItems
		]);
	}
	return bankItems;
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 20,
			usage: '<member:member> <price:int{0,100000000000}> <item:...itemList>',
			usageDelim: ' ',
			oneAtTime: true,
			ironCantUse: true
		});
	}

	async run(
		msg: KlasaMessage,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		[buyerMember, price, items]: [GuildMember, number, ItemList[]]
	) {
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
			await this.sell(msg, buyerMember, price, items);
		} finally {
			buyerMember.user.toggleBusy(false);
			msg.author.toggleBusy(false);
		}
	}

	async sell(msg: KlasaMessage, buyerMember: GuildMember, price: number, items: ItemList[]) {
		const sellerBank = msg.author.settings.get(UserSettings.Bank);
		let priceBotPays = 0;
		let youDontHave: ItemBank = {};
		let itemsForSale: ItemBank = {};
		for (const item of items) {
			const osItem = item.possibilities.find(i => sellerBank[i.id] && !itemsForSale[i.id]);
			if (!osItem || sellerBank[osItem.id] < item.qty) {
				youDontHave = addBanks([youDontHave, { [item.possibilities[0].id]: item.qty }]);
			} else {
				priceBotPays +=
					Math.floor((await this.client.fetchItemPrice(osItem.id)) * 0.8) *
					Number(item.qty);
				itemsForSale = addBanks([itemsForSale, { [osItem.id]: item.qty }]);
			}
		}
		if (Object.values(youDontHave).length > 0) {
			throw `You don't have **${await createReadableItemListFromBank(
				this.client,
				youDontHave
			)}**.`;
		}
		const itemsForSaleString = await createReadableItemListFromBank(this.client, itemsForSale);
		let sellStr = `${
			msg.author
		}, say \`confirm\` to confirm that you want to sell **${itemsForSaleString}** to \`${
			buyerMember.user.username
		}#${buyerMember.user.discriminator}\` for ${
			price > 0 ? `a *total* of ${Util.toKMB(price)} GP (${price.toLocaleString()})` : 'free'
		}.`;

		if (priceBotPays > price) {
			sellStr += `\n\n**WARNING**: The bot would pay you more (**${priceBotPays.toLocaleString()}** GP) for these items than you are selling them for!`;
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
				return sellMsg.edit(`Cancelling sale of **${itemsForSaleString}**.`);
			}
		}

		// Confirm the buyer wants to buy
		const buyerConfirmationMsg = await msg.channel.send(
			`${buyerMember}, do you wish to buy ${itemsForSaleString} from \`${
				msg.author.username
			}#${msg.author.discriminator}\` for ${
				price > 0 ? `${Util.toKMB(price)} GP (${price.toLocaleString()})` : 'free'
			}? Say \`buy\` to confirm.`
		);

		try {
			await msg.channel.awaitMessages(
				_msg =>
					_msg.author.id === buyerMember.user.id && _msg.content.toLowerCase() === 'buy',
				options
			);
		} catch (err) {
			await buyerConfirmationMsg.edit(`Cancelling sale of ${itemsForSaleString}.`);
			return msg.channel.send(`Cancelling sale of ${itemsForSaleString}.`);
		}

		try {
			// rechecking if seller still has the items and the buying still has the gp
			if (
				!(await bankHasAllItemsFromBank(sellerBank, itemsForSale)) ||
				(await buyerMember.user.settings.get(UserSettings.GP)) < price
			) {
				return msg.send(`One of you lacks the required GP or items to make this trade.`);
			}

			await buyerMember.user.removeGP(price);
			await msg.author.addGP(price);

			const buyerBank = buyerMember.user.settings.get(UserSettings.Bank);
			// remove items from seller
			await msg.author.settings.update(
				UserSettings.Bank,
				addBanks([removeBankFromBank(sellerBank, itemsForSale)])
			);
			// add items to buying
			await buyerMember.user.settings.update(
				UserSettings.Bank,
				addBanks([buyerBank, itemsForSale])
			);
		} catch (err) {
			this.client.emit(Events.Wtf, err);
			return msg.send(`Fatal error occurred. Please seek help in the support server.`);
		}
		msg.author.log(
			`sold ${itemsForSaleString} itemID[${Object.entries(itemsForSale)
				.map(_i => `${_i[0]}:${_i[1]}`)
				.join(',')}] to ${buyerMember.user.sanitizedName} for ${price}`
		);

		return msg.send(`Sale of **${itemsForSaleString}** complete!`);
	}
}
