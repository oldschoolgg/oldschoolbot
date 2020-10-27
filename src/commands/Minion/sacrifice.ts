import { CommandStore, KlasaMessage } from 'klasa';
import { Util } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/BotCommand';
import { Events } from '../../lib/constants';
import minionIcons from '../../lib/minions/data/minionIcons';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { addItemToBank, itemID, roll } from '../../lib/util';
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
			usage: '[quantity:int{1}] [item:...item]',
			usageDelim: ' ',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage, [quantity, itemArray]: [number | undefined, Item[]]) {
		if (!itemArray) {
			return msg.send(
				`Your current sacrificed amount is: ${msg.author.settings
					.get(UserSettings.SacrificedValue)
					.toLocaleString()}. You can see the icons you can unlock here: <https://www.oldschool.gg/oldschoolbot/minions?Minion%20Icons>`
			);
		}

		const userBank = msg.author.settings.get(UserSettings.Bank);
		const osItem = itemArray.find(i => userBank[i.id] && itemIsTradeable(i.id));

		if (!osItem) {
			return msg.send(
				`You don't have any of this item to sacrifice, or it is not tradeable.`
			);
		}

		const numItemsHas = userBank[osItem.id];
		if (!quantity) {
			quantity = numItemsHas;
		}

		if (quantity > numItemsHas) {
			return msg.send(`You dont have ${quantity}x ${osItem.name}.`);
		}

		let priceOfItem = await this.client.fetchItemPrice(osItem.id);
		const hasSkipper = msg.author.equippedPet() === itemID('Skipper');
		if (hasSkipper) {
			priceOfItem *= 1.4;
		}
		const totalPrice = priceOfItem * quantity;

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const sellMsg = await msg.channel.send(
				`${msg.author}, say \`confirm\` to sacrifice ${quantity} ${
					osItem.name
				}, this will add ${totalPrice.toLocaleString()} (${Util.toKMB(
					totalPrice
				)}) to your sacrificed amount.`
			);

			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					options
				);
			} catch (err) {
				return sellMsg.edit(`Cancelling sacrifice of ${quantity}x ${osItem.name}.`);
			}
		}

		if (priceOfItem > 50_000_000) {
			this.client.emit(
				Events.ServerNotification,
				`${msg.author.username} just sacrificed ${quantity}x ${osItem.name}!`
			);
		}

		const gotHammy = totalPrice >= 51_530_000 && roll(140);
		if (gotHammy) {
			await msg.author.addItemsToBank({ [itemID('Hammy')]: 1 });
		}

		let str = '';

		if (totalPrice >= 30_000_000 && roll(10)) {
			str += `You received a *Hunk of crystal*.`;
			await msg.author.addItemsToBank({ 742: 1 });
		}

		const newValue = msg.author.settings.get(UserSettings.SacrificedValue) + totalPrice;

		await msg.author.settings.update(UserSettings.SacrificedValue, newValue);
		await msg.author.removeItemFromBank(osItem.id, quantity);

		await this.client.settings.update(
			ClientSettings.EconomyStats.SacrificedBank,
			addItemToBank(
				this.client.settings.get(ClientSettings.EconomyStats.SacrificedBank),
				osItem.id,
				quantity
			)
		);

		msg.author.log(`sacrificed Quantity[${quantity}] ItemID[${osItem.id}] for ${totalPrice}`);

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
		if (hasSkipper)
			str += `\n<:skipper:755853421801766912> Skipper has negotiated with the bank and gotten you +40% extra value from your sacrifice.`;

		return msg.send(
			`You sacrificed ${quantity}x ${
				osItem.name
			}, with a value of ${totalPrice.toLocaleString()}gp (${Util.toKMB(
				totalPrice
			)}). Your total amount sacrificed is now: ${newValue.toLocaleString()}. ${str}`
		);
	}
}
