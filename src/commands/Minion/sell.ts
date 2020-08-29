import { KlasaMessage, CommandStore } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import {
	bankHasAllItemsFromBank,
	getItemsAndQuantityFromStringList,
	removeBankFromBank
} from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import getOSItem from '../../lib/util/getOSItem';
import { addBanks } from 'oldschooljs/dist/util';
import { Util } from 'oldschooljs';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';

export default class extends BotCommand {
	public SALE_TAX = 0.8;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '(item:...string)',
			usageDelim: ' ',
			oneAtTime: true,
			ironCantUse: true
		});
	}

	async run(msg: KlasaMessage, [items]: [string]) {
		if (msg.author.isIronman) throw `Iron players can't sell items.`;
		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const toSell = await getItemsAndQuantityFromStringList(items, userBank);
		const toSellString = await createReadableItemListFromBank(this.client, toSell);
		if (!bankHasAllItemsFromBank(userBank, toSell)) {
			throw `You can't sell what you don't have! Make sure you have **${toSellString}** in your bank!`;
		}
		let cantSell = {};
		let totalPrice = 0;
		let totalPriceTax = 0;
		for (const [itemID, qty] of Object.entries(toSell)) {
			if (!getOSItem(itemID).tradeable) {
				cantSell = addBanks([{ [itemID]: qty }, cantSell]);
			} else {
				const itemPrice = await this.client.fetchItemPrice(itemID);
				totalPrice += itemPrice * qty;
			}
		}
		if (Object.entries(cantSell).length > 0) {
			throw `The following items are not tradeable: **${await createReadableItemListFromBank(
				this.client,
				cantSell
			)}**. Untradeable items can not be sold.`;
		}
		totalPriceTax = totalPrice * 0.2;
		if (totalPrice > 3) totalPrice *= 0.8;
		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const sellMsg = await msg.channel.send(
				`${msg.author}, say \`confirm\` to sell ${await createReadableItemListFromBank(
					this.client,
					toSell
				)} for ${totalPrice.toLocaleString()} gp (${Util.toKMB(totalPrice)}).`
			);
			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					{
						max: 1,
						time: 10000,
						errors: ['time']
					}
				);
			} catch (err) {
				return sellMsg.edit(`Cancelling sale of ${toSellString}.`);
			}
		}
		await msg.author.settings.update(
			UserSettings.Bank,
			addBanks([removeBankFromBank(userBank, toSell)])
		);
		await msg.author.settings.update(
			UserSettings.GP,
			msg.author.settings.get(UserSettings.GP) + totalPrice
		);
		const itemSellTaxBank = this.client.settings.get(
			ClientSettings.EconomyStats.ItemSellTaxBank
		);
		const dividedAmount = totalPriceTax / 1_000_000;
		this.client.settings.update(
			ClientSettings.EconomyStats.ItemSellTaxBank,
			Math.floor(itemSellTaxBank + Math.round(dividedAmount * 100) / 100)
		);
		msg.author.log(
			`sold Quantity[${Object.values(toSell)
				.map(qty => `${qty}`)
				.join(',')}] ItemID[${Object.keys(toSell)
				.map(id => `${id}`)
				.join(',')}] for ${totalPrice}, taxed ${totalPriceTax}`
		);
		return msg.send(
			`Sold ${await createReadableItemListFromBank(
				this.client,
				toSell
			)} for ${totalPrice.toLocaleString()}gp (${Util.toKMB(totalPrice)})`
		);
	}
}
