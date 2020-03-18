import { KlasaMessage, CommandStore } from 'klasa';
import { Items } from 'oldschooljs';
import { toKMB, fromKMB } from 'oldschooljs/dist/util/util';

import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/UserSettings';
import { ClientSettings } from '../../lib/ClientSettings';
import cleanItemName from '../../lib/util/cleanItemName';
import { removeItemFromBank } from '../../lib/util';
import Loot from 'oldschooljs/dist/structures/Loot';
import user from '../Utility/user';

const options = {
	max: 1,
	time: 10000,
	errors: ['time']
};

const specialUntradeables = [995];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			// usage: '<quantity:int{1}|itemname:...string> [itemname:...string]',
			usage: '[quantity:int{1}|itemname:...string] [itemname:...string]',
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage, [quantity, itemName]: [number | string, string]) {
		if (typeof quantity == 'number') {
			if (typeof itemName === undefined) throw `Item name is required.`;
			const osItem = Items.get(cleanItemName(itemName));
			if (!osItem) throw `That item doesnt exist.`;
			if (
				specialUntradeables.includes(osItem.id) ||
				!('tradeable' in osItem) ||
				!osItem.tradeable
			) {
				throw `That item isn't tradeable.`;
			}

			const priceOfItem = await this.client.fetchItemPrice(osItem.id);
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
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
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
		}
		const action = quantity;
		const flags = msg.flagArgs;
		const { max } = flags;

		if (action === 'all') {
			const bank = msg.author.settings.get(UserSettings.Bank);
			let message = `${msg.author}, say \`confirm\` to sell the following items:\n\n`;
			let totalItemsToBeSold = 0;
			let totalSellPrice = 0;
			for (const itemID in bank) {
				if (bank[itemID] === 0) {
					delete bank[itemID];
				} else {
					const osItem = Items.get(parseInt(itemID));

					if (!osItem) throw `That item doesnt exist.`;
					if (!('tradeable' in osItem) || !osItem.tradeable) continue;

					const priceOfItem = await this.client.fetchItemPrice(itemID);

					if (typeof max === 'string') {
						const realMax = fromKMB(max);

						if (!Number.isInteger(realMax)) throw `Invalid value for flag 'max'.`;

						if (bank[itemID] * priceOfItem > realMax) {
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

					message += ` - ${quantity} ${
						osItem.name
						} for ${totalPrice.toLocaleString()} (${toKMB(totalPrice)}).\n`;
				}
			}

			message += `\n For a grand total of: ${totalSellPrice.toLocaleString()}`;

			if (totalItemsToBeSold === 0) throw "You don't have any items to sell.";

			const sellMsg = await msg.channel.send(message);

			try {
				const collected = await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					options
				);
				if (!collected || !collected.first()) {
					throw "This shouldn't be possible...";
				}
			} catch (err) {
				return sellMsg.edit(`Cancelling sale.`);
			}

			let removeThese = new Loot();
			if (1 === 1) {
				for (const itemID in bank) {
					removeThese = loot.add(parseInt(itemID), bank[itemID]);
				}
			}
			await user.removeItemFromBank(removeThese, 1);

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
