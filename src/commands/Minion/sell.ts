import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Util } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { itemID } from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import itemIsTradeable from '../../lib/util/itemIsTradeable';
import { ItemResult } from '../../lib/util/parseStringBank';

const options = {
	max: 1,
	time: 10000,
	errors: ['time']
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			usage: '<items:BankArray>',
			oneAtTime: true,
			ironCantUse: true,
			categoryFlags: ['minion'],
			description: 'Sells an item to the bot for 80% of G.E price.',
			examples: ['+sell bronze arrow']
		});
	}

	async run(msg: KlasaMessage, [items]: [ItemResult[]]) {
		if (msg.author.isIronman) return msg.send(`Iron players can't sell items.`);
		let bankToSell = new Bank();
		const userBank = msg.author.bank();
		let totalPrice = 0;
		for (const item of items) {
			const { id } = item.item;
			if (itemIsTradeable(id) && userBank.amount(id) >= item.qty) {
				bankToSell.add(id, item.qty);
				totalPrice += (await this.client.fetchItemPrice(id)) * item.qty;
			}
		}

		if (Object.keys(bankToSell.bank).length === 0) {
			return msg.send(
				`You don't have enough of the items you provided, or none of them are tradeable.`
			);
		}

		const hasSkipper =
			msg.author.equippedPet() === itemID('Skipper') ||
			msg.author.numItemsInBankSync(itemID('Skipper')) > 0;

		totalPrice = hasSkipper ? totalPrice : Math.floor(totalPrice * 0.8);
		const readableStr = await createReadableItemListFromBank(this.client, bankToSell.bank);

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const sellMsg = await msg.channel.send(
				`${
					msg.author
				}, say \`confirm\` to sell ${readableStr} for ${totalPrice.toLocaleString()} (${Util.toKMB(
					totalPrice
				)}).`
			);

			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					options
				);
			} catch (err) {
				return sellMsg.edit(`Cancelling sale.`);
			}
		}

		const tax = hasSkipper ? 0 : Math.ceil((totalPrice / 0.8) * 0.2);

		await msg.author.removeItemsFromBank(bankToSell.bank);
		await msg.author.settings.update(
			UserSettings.GP,
			msg.author.settings.get(UserSettings.GP) + totalPrice
		);

		const itemSellTaxBank = this.client.settings.get(
			ClientSettings.EconomyStats.ItemSellTaxBank
		);
		const dividedAmount = tax / 1_000_000;
		this.client.settings.update(
			ClientSettings.EconomyStats.ItemSellTaxBank,
			Math.floor(itemSellTaxBank + Math.round(dividedAmount * 100) / 100)
		);

		msg.author.log(`sold ${readableStr} for ${totalPrice}`);

		return msg.send(
			`Sold ${readableStr} for ${totalPrice.toLocaleString()}gp (${Util.toKMB(
				totalPrice
			)}). Tax: ${tax.toLocaleString()} ${
				hasSkipper
					? `\n\n<:skipper:755853421801766912> Skipper has negotiated with the bank and you weren't charged any tax on the sale!`
					: ''
			}`
		);
	}
}
