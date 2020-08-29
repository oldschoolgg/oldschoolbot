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
import { Events } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import minionIcons from '../../lib/minions/data/minionIcons';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '(item:...string)',
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage, [items]: [string]) {
		if (!items) {
			return msg.send(
				`Your current sacrificed amount is: ${msg.author.settings
					.get(UserSettings.SacrificedValue)
					.toLocaleString()}. You can see the icons you can unlock here: <https://www.oldschool.gg/oldschoolbot/minions?Minion%20Icons>`
			);
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);
		const toSacrifice = await getItemsAndQuantityFromStringList(items, userBank);
		const toSacrificeString = await createReadableItemListFromBank(this.client, toSacrifice);
		if (!bankHasAllItemsFromBank(userBank, toSacrifice)) {
			throw `You can't sacrifice what you don't have! Make sure you have **${toSacrificeString}** in your bank!`;
		}
		let cantSell = {};
		let totalPrice = 0;
		for (const [itemID, qty] of Object.entries(toSacrifice)) {
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
			)}**. Untradeable items can not be sacrificed.`;
		}

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const sellMsg = await msg.channel.send(
				`${msg.author}, say \`confirm\` to sacrifice ${await createReadableItemListFromBank(
					this.client,
					toSacrifice
				)}, this will add ${totalPrice.toLocaleString()} to your sacrificed amount.`
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
				return sellMsg.edit(`Cancelling sacrifice of ${toSacrificeString}.`);
			}
		}

		if (totalPrice > 50_000_000) {
			this.client.emit(
				Events.ServerNotification,
				`${msg.author.username} just sacrificed ${toSacrificeString}!`
			);
		}

		const newValue = msg.author.settings.get(UserSettings.SacrificedValue) + totalPrice;
		await msg.author.settings.update(UserSettings.SacrificedValue, newValue);
		await msg.author.settings.update(
			UserSettings.Bank,
			addBanks([removeBankFromBank(userBank, toSacrifice)])
		);

		await this.client.settings.update(
			ClientSettings.EconomyStats.SacrificedBank,
			addBanks([
				toSacrifice,
				this.client.settings.get(ClientSettings.EconomyStats.SacrificedBank)
			])
		);
		msg.author.log(
			`sacrificed Quantity[${Object.values(toSacrifice)
				.map(qty => `${qty}`)
				.join(',')}] ItemID[${Object.keys(toSacrifice)
				.map(id => `${id}`)
				.join(',')}] for ${totalPrice}`
		);

		let str = '';
		const currentIcon = msg.author.settings.get(UserSettings.Minion.Icon);
		for (const icon of minionIcons) {
			if (newValue < icon.valueRequired) continue;
			if (newValue >= icon.valueRequired) {
				if (currentIcon === icon.emoji) break;
				await msg.author.settings.update(UserSettings.Minion.Icon, icon.emoji);
				str += `\n\nYou have now unlocked the **${icon.name}** minion icon!`;
				this.client.emit(
					Events.ServerNotification,
					`**${msg.author.username}** just unlocked the ${icon.emoji} icon for their minion.`
				);
				break;
			}
		}

		return msg.send(
			`You sacrificed ${await createReadableItemListFromBank(
				this.client,
				toSacrifice
			)}, with a value of ${totalPrice.toLocaleString()}gp (${Util.toKMB(
				totalPrice
			)}). Your total amount sacrificed is now: ${newValue.toLocaleString()}. ${str}`
		);
	}
}
