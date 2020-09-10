import { KlasaMessage, CommandStore } from 'klasa';
import { BotCommand } from '../../lib/BotCommand';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { removeBankFromBank, roll } from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { addBanks } from 'oldschooljs/dist/util';
import { Util } from 'oldschooljs';
import { Events } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import minionIcons from '../../lib/minions/data/minionIcons';
import itemID from '../../lib/util/itemID';
import { ItemList } from '../../lib/minions/types';
import { ItemBank } from '../../lib/types';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '<item:...itemList>',
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage, [items]: [ItemList[]]) {
		if (!items) {
			return msg.send(
				`Your current sacrificed amount is: ${msg.author.settings
					.get(UserSettings.SacrificedValue)
					.toLocaleString()}. You can see the icons you can unlock here: <https://www.oldschool.gg/oldschoolbot/minions?Minion%20Icons>`
			);
		}
		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);

		let youDontHave: ItemBank = {};
		let itemsForSacrifice: ItemBank = {};
		let totalPrice = 0;

		for (const item of items) {
			const osItem = item.possibilities.find(
				i =>
					userBank[i.id] &&
					i.tradeable_on_ge &&
					(!itemsForSacrifice[i.id] || !itemsForSacrifice[i.id])
			);
			const itemQTY = !item.qtyInformed && osItem ? userBank[osItem.id] : item.qty;
			if (!osItem || userBank[osItem.id] < itemQTY) {
				youDontHave = addBanks([youDontHave, { [item.possibilities[0].id]: itemQTY }]);
			} else {
				totalPrice += (await this.client.fetchItemPrice(osItem.id)) * itemQTY;
				itemsForSacrifice = addBanks([itemsForSacrifice, { [osItem.id]: itemQTY }]);
			}
		}

		if (Object.entries(youDontHave).length > 0) {
			throw `The following items are not tradeable or you don't own: **${await createReadableItemListFromBank(
				this.client,
				youDontHave
			)}**. Untradeable items can not be sacrificed.`;
		}

		const toSacrificeString = await createReadableItemListFromBank(
			this.client,
			itemsForSacrifice
		);

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const sellMsg = await msg.channel.send(
				`${
					msg.author
				}, say \`confirm\` to sacrifice **${await createReadableItemListFromBank(
					this.client,
					itemsForSacrifice
				)}**, this will add **${totalPrice.toLocaleString()}** to your sacrificed amount.`
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
				return sellMsg.edit(`Cancelling sacrifice of **${toSacrificeString}**.`);
			}
		}

		if (totalPrice > 50_000_000) {
			this.client.emit(
				Events.ServerNotification,
				`${msg.author.username} just sacrificed ${toSacrificeString}!`
			);
		}

		const gotHammy = totalPrice >= 51_530_000 && roll(140);
		if (gotHammy) {
			await msg.author.addItemsToBank({ [itemID('Hammy')]: 1 });
		}

		const newValue = msg.author.settings.get(UserSettings.SacrificedValue) + totalPrice;
		await msg.author.settings.update(UserSettings.SacrificedValue, newValue);
		await msg.author.settings.update(
			UserSettings.Bank,
			addBanks([removeBankFromBank(userBank, itemsForSacrifice)])
		);

		await this.client.settings.update(
			ClientSettings.EconomyStats.SacrificedBank,
			addBanks([
				itemsForSacrifice,
				this.client.settings.get(ClientSettings.EconomyStats.SacrificedBank)
			])
		);
		msg.author.log(
			`sacrificed Quantity[${Object.values(itemsForSacrifice)
				.map(qty => `${qty}`)
				.join(',')}] ItemID[${Object.keys(itemsForSacrifice)
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
		if (gotHammy) {
			str += `\n\n<:Hamstare:685036648089780234> A small hamster called Hammy has crawled into your bank and is now staring intensely into your eyes.`;
		}

		return msg.send(
			`You sacrificed ${await createReadableItemListFromBank(
				this.client,
				itemsForSacrifice
			)}, with a value of ${totalPrice.toLocaleString()}gp (${Util.toKMB(
				totalPrice
			)}). Your total amount sacrificed is now: ${newValue.toLocaleString()}. ${str}`
		);
	}
}
