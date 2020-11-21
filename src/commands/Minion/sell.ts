import { CommandStore, KlasaMessage } from 'klasa';
import { Util } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/BotCommand';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { itemID } from '../../lib/util';
import itemIsTradeable from '../../lib/util/itemIsTradeable';

const options = {
	max: 1,
	time: 10000,
	errors: ['time']
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[quantity:int{1}] (item:...item)',
			usageDelim: ' ',
			oneAtTime: true,
			ironCantUse: true,
			categoryFlags: ['minion'],
			description: 'Sells an item to the bot for 80% of G.E price.',
			examples: ['+sell bronze arrow']
		});
	}

	async run(msg: KlasaMessage, [quantity, itemArray]: [number | undefined, Item[]]) {
		if (msg.author.isIronman) return msg.send(`Iron players can't sell items.`);
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const osItem = itemArray.find(i => userBank[i.id] && itemIsTradeable(i.id));

		if (!osItem) {
			return msg.send(`You don't have any of this item to sell, or it is not tradeable.`);
		}

		const numItemsHas = userBank[osItem.id];
		if (!quantity) {
			quantity = numItemsHas;
		}

		const priceOfItem = await this.client.fetchItemPrice(osItem.id);
		let totalPrice = priceOfItem * quantity;

		if (quantity > numItemsHas) {
			return msg.send(`You dont have ${quantity}x ${osItem.name}.`);
		}

		const hasSkipper = msg.author.equippedPet() === itemID('Skipper');

		if (totalPrice > 3 && !hasSkipper) {
			totalPrice = Math.floor(totalPrice * 0.8);
		}

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const sellMsg = await msg.channel.send(
				`${msg.author}, say \`confirm\` to sell ${quantity} ${
					osItem.name
				} for ${totalPrice.toLocaleString()} (${Util.toKMB(totalPrice)}).`
			);

			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					options
				);
			} catch (err) {
				return sellMsg.edit(`Cancelling sale of ${quantity}x ${osItem.name}.`);
			}
		}

		await msg.author.removeItemFromBank(osItem.id, quantity);
		await msg.author.settings.update(
			UserSettings.GP,
			msg.author.settings.get(UserSettings.GP) + totalPrice
		);

		const itemSellTaxBank = this.client.settings.get(
			ClientSettings.EconomyStats.ItemSellTaxBank
		);
		const dividedAmount = (priceOfItem * quantity * 0.2) / 1_000_000;
		this.client.settings.update(
			ClientSettings.EconomyStats.ItemSellTaxBank,
			Math.floor(itemSellTaxBank + Math.round(dividedAmount * 100) / 100)
		);

		msg.author.log(`sold Quantity[${quantity}] ItemID[${osItem.id}] for ${totalPrice}`);

		return msg.send(
			`Sold ${quantity}x ${osItem.name} for ${totalPrice.toLocaleString()}gp (${Util.toKMB(
				totalPrice
			)})${
				hasSkipper
					? `\n\n<:skipper:755853421801766912> Skipper has negotiated with the bank and you weren't charged any tax on the sale!`
					: ''
			}`
		);
	}
}
