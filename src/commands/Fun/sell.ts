import { KlasaMessage, KlasaClient, CommandStore } from 'klasa';
import { Items } from 'oldschooljs';
const oldschooljs = require("oldschooljs");
import { toKMB, fromKMB } from 'oldschooljs/dist/util/util';
import { Bank } from '../../lib/types';

import { BotCommand } from '../../lib/BotCommand';
import { UserSettings, ClientSettings } from '../../lib/constants';

const options = {
	max: 1,
	time: 10000,
	errors: ['time']
};

const specialUntradeables = [995];

export default class extends BotCommand {
	public constructor(
		client: KlasaClient,
		store: CommandStore,
		file: string[],
		directory: string
	) {
		super(client, store, file, directory, {
			cooldown: 1,
			// usage: '<quantity:int{1}|itemname:...string> [itemname:...string]',
			usage: '[quantity:int{1}|itemname:...string] [itemname:...string]',
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage, [quantity, itemName]: [number | string, string], flags: { [key: string]: string | number } = {}) {

		if (typeof quantity == "number") {
			if (typeof itemName === undefined) throw `Item name is required.`;
			let re = /’/gi;
			const osItem = Items.get(itemName.replace(re,"'"));
			if (!osItem) throw `That item doesnt exist.`;
			if (
				specialUntradeables.includes(osItem.id) ||
				!('tradeable' in osItem) ||
				!osItem.tradeable
			) {
				throw `That item isn't tradeable.`;
			}

			let priceOfItem = await this.client.fetchItemPrice(osItem.id);
			let totalPrice = priceOfItem * quantity;

			const hasItem = await msg.author.hasItem(osItem.id, quantity);
			if (!hasItem) {
				throw `You dont have ${quantity}x ${osItem.name}.`;
			}

			if (totalPrice > 3) {
				totalPrice = Math.floor(totalPrice * 0.8);
			}

			const sellMsg = await msg.channel.send(
				`${msg.author}, say \`confirm\` to sell ${quantity} ${
					osItem.name
				} for ${totalPrice.toLocaleString()} (${toKMB(totalPrice)}).`
			);

			try {
				const collected = await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'confirm',
					options
				);
				if (!collected || !collected.first()) {
					throw "This shouldn't be possible...";
				}
			} catch (err) {
				return sellMsg.edit(`Cancelling sale of ${quantity}x ${osItem.name}.`);
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
				itemSellTaxBank + Math.round(dividedAmount * 100) / 100
			);

			msg.author.log(`sold Quantity[${quantity}] ItemID[${osItem.id}] for ${totalPrice}`);

			return msg.send(
				`Sold ${quantity}x ${osItem.name} for ${totalPrice.toLocaleString()}gp (${toKMB(
					totalPrice
				)})`
			);
		} else {
			let action = quantity;
			const flags = msg.flagArgs;
			const max = flags.max;

			if (action == "all") {

				const bank: Bank = msg.author.settings.get('bank');
				let message = `${msg.author}, say \`confirm\` to sell the following items:\n\n`;
				let totalItemsToBeSold = 0;
				let totalSellPrice = 0;
				for (const itemID in bank) {
					if (bank[itemID] === 0) {
						delete bank[itemID];
					}
					else {
						const osItem = oldschooljs.Items.get(parseInt(itemID));

						if (!osItem) throw `That item doesnt exist.`;
						if (!('tradeable' in osItem) || !osItem.tradeable) continue;

						let priceOfItem = await this.client.fetchItemPrice(itemID);

						if (typeof max === "string") {

							let realMax = fromKMB(max);

							 if (!Number.isInteger(realMax)) throw `Invalid value for flag 'max'.`;

							 if (priceOfItem > realMax) {
							 	delete bank[itemID];
							 	continue;
							 }
						}

						let totalPrice = priceOfItem * bank[itemID];

						if (totalPrice > 3) {
							totalPrice = Math.floor(totalPrice * 0.8);
						}

						console.log(priceOfItem, bank[osItem.id], totalPrice);

						totalSellPrice += totalPrice;
						totalItemsToBeSold++;

						message += ` - ${quantity} ${osItem.name} for ${totalPrice.toLocaleString()} (${toKMB(totalPrice)}).\n`;
					}
				}

				message += `\n For a grand total of: ${totalSellPrice.toLocaleString()}`;

				if (totalItemsToBeSold == 0) throw "You don't have any items to sell.";

				const sellMsg = await msg.channel.send(message);


				try {
					const collected = await msg.channel.awaitMessages(
						_msg =>
							_msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'confirm',
						options
					);
					if (!collected || !collected.first()) {
						throw "This shouldn't be possible...";
					}
				} catch (err) {
					return sellMsg.edit(`Cancelling sale.`);
				}

				for (const itemID in bank) {
					await msg.author.removeItemFromBank(parseInt(itemID), bank[itemID]);
				}

				await msg.author.settings.update(
					UserSettings.GP,
					msg.author.settings.get(UserSettings.GP) + totalSellPrice
				);

				const itemSellTaxBank = this.client.settings.get(
					ClientSettings.EconomyStats.ItemSellTaxBank
				);
				const dividedAmount = (totalSellPrice * 0.2) / 1_000_000;

				this.client.settings.update(
					ClientSettings.EconomyStats.ItemSellTaxBank,
					itemSellTaxBank + Math.round(dividedAmount * 100) / 100
				);

				return msg.send(
					`Sold all listed items for a total of ${totalSellPrice.toLocaleString()}!`
				);
			}
		}
	}
}
