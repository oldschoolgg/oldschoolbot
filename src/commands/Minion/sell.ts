import { KlasaMessage, CommandStore } from 'klasa';
import { Items } from 'oldschooljs';
import { toKMB } from 'oldschooljs/dist/util/util';

import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/UserSettings';
import { ClientSettings } from '../../lib/ClientSettings';
import itemIsTradeable from '../../lib/util/itemIsTradeable';
import cleanItemName from '../../lib/util/cleanItemName';

const options = {
	max: 1,
	time: 10000,
	errors: ['time']
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '<quantity:int{1}> <itemname:...string>',
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage, [quantity, itemName]: [number, string]) {
		const osItem = Items.get(cleanItemName(itemName));
		if (!osItem) throw `That item doesnt exist.`;
		if (!itemIsTradeable(osItem.id)) {
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

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const sellMsg = await msg.channel.send(
				`${msg.author}, say \`confirm\` to sell ${quantity} ${
					osItem.name
				} for ${totalPrice.toLocaleString()} (${toKMB(totalPrice)}).`
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
			`Sold ${quantity}x ${osItem.name} for ${totalPrice.toLocaleString()}gp (${toKMB(
				totalPrice
			)})`
		);
	}
}
