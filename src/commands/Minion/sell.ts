import { KlasaMessage, CommandStore } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { removeBankFromBank } from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { addBanks } from 'oldschooljs/dist/util';
import { Util } from 'oldschooljs';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { ItemList } from '../../lib/minions/types';
import { ItemBank } from '../../lib/types';

export default class extends BotCommand {
	public SALE_TAX = 0.8;

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '<item:...itemList>',
			usageDelim: ' ',
			oneAtTime: true,
			ironCantUse: true
		});
	}

	async run(msg: KlasaMessage, [items]: [ItemList[]]) {
		if (msg.author.isIronman) throw `Iron players can't sell items.`;

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);

		let cantSellItems: ItemBank = {};
		let itemsForSale: ItemBank = {};
		let totalPrice = 0;
		let totalPriceTax = 0;

		for (const item of items) {
			const osItem = item.possibilities.find(
				i =>
					userBank[i.id] &&
					i.tradeable_on_ge &&
					(!itemsForSale[i.id] || !cantSellItems[i.id])
			);
			const itemQTY = !item.qtyInformed && osItem ? userBank[osItem.id] : item.qty;
			if (!osItem || userBank[osItem.id] < itemQTY) {
				cantSellItems = addBanks([cantSellItems, { [item.possibilities[0].id]: itemQTY }]);
			} else {
				totalPrice += (await this.client.fetchItemPrice(osItem.id)) * itemQTY;
				itemsForSale = addBanks([itemsForSale, { [osItem.id]: itemQTY }]);
			}
		}

		const toSellString = await createReadableItemListFromBank(this.client, itemsForSale);

		if (Object.entries(cantSellItems).length > 0) {
			throw `The following items are not tradeable or you don't have any of: **${await createReadableItemListFromBank(
				this.client,
				cantSellItems
			)}**. Untradeable items can not be sold.`;
		}

		// apply sale tax
		if (totalPrice > 3) {
			totalPriceTax = totalPrice * 0.2;
			totalPrice *= 0.8;
		}

		if (totalPrice > 3) totalPrice *= 0.8;
		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const sellMsg = await msg.channel.send(
				`${
					msg.author
				}, say \`confirm\` to sell **${toSellString}** for ${totalPrice.toLocaleString()} gp (${Util.toKMB(
					totalPrice
				)}).`
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
				return sellMsg.edit(`Cancelling sale of **${toSellString}**.`);
			}
		}
		await msg.author.settings.update(
			UserSettings.Bank,
			addBanks([removeBankFromBank(userBank, itemsForSale)])
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
			`sold Quantity[${Object.values(itemsForSale)
				.map(qty => `${qty}`)
				.join(',')}] ItemID[${Object.keys(itemsForSale)
				.map(id => `${id}`)
				.join(',')}] for ${totalPrice}, taxed ${totalPriceTax}`
		);
		return msg.send(
			`Sold **${toSellString}** for **${totalPrice.toLocaleString()} GP (${Util.toKMB(
				totalPrice
			)})**`
		);
	}
}
