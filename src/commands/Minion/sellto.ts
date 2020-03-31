import { KlasaMessage, CommandStore } from 'klasa';
import { Util } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import itemIsTradeable from '../../lib/util/itemIsTradeable';
import cleanItemName from '../../lib/util/cleanItemName';
import { GuildMember } from 'discord.js';
import { Events, TradeableItems } from '../../lib/constants';
import { UserSettings } from '../../lib/UserSettings';
import { Item, PartialItem } from 'oldschooljs/dist/meta/types';
import { stringMatches } from '../../lib/util';

const options = {
	max: 1,
	time: 20000,
	errors: ['time']
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 20,
			usage:
				'<member:member> <price:int{1,100000000000}> <quantity:int{1,2000000}> <itemname:...string>',
			usageDelim: ' ',
			oneAtTime: true,
			ironCantUse: true
		});
	}

	async run(
		msg: KlasaMessage,
		[buyerMember, price, quantity, itemName]: [GuildMember, number, number, string]
	) {
		if (msg.author.isIronman) throw `Iron players can't sell items.`;
		if (buyerMember.user.isIronman) throw `Iron players can't be sold items.`;
		if (buyerMember.user.id === msg.author.id) throw `You can't trade yourself.`;
		if (buyerMember.user.bot) throw `You can't trade a bot.`;
		if (buyerMember.user.isBusy) {
			throw `That user is busy right now.`;
		}

		if (buyerMember.user.settings.get(UserSettings.GP) < price) {
			throw `That user doesn't have enough GP :(`;
		}
		const osItem = TradeableItems.find(item =>
			stringMatches(item.name, cleanItemName(itemName))
		);
		if (!osItem) throw `That item doesnt exist.`;
		const tradeable = itemIsTradeable(osItem.id);

		if (!tradeable) {
			throw `That item is not tradeable.`;
		}

		buyerMember.user.toggleBusy(true);
		msg.author.toggleBusy(true);
		try {
			await this.sell(msg, buyerMember, price, quantity, osItem);
		} finally {
			buyerMember.user.toggleBusy(false);
			msg.author.toggleBusy(false);
		}
	}

	async sell(
		msg: KlasaMessage,
		buyerMember: GuildMember,
		price: number,
		quantity: number,
		osItem: Item | PartialItem
	) {
		const hasItem = await msg.author.hasItem(osItem.id, quantity);
		if (!hasItem) {
			throw `You dont have ${quantity}x ${osItem.name}.`;
		}

		const itemDesc = `${quantity}x ${osItem.name}`;
		const priceDesc = `${Util.toKMB(price)} GP (${price.toLocaleString()})`;

		const sellMsg = await msg.channel.send(
			`${msg.author}, say \`confirm\` to confirm that you want to sell ${itemDesc} to \`${buyerMember.user.username}#${buyerMember.user.discriminator}\` for a *total* of ${priceDesc}.`
		);

		// Confirm the seller wants to sell
		try {
			await msg.channel.awaitMessages(
				_msg =>
					_msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'confirm',
				options
			);
		} catch (err) {
			return sellMsg.edit(`Cancelling sale of ${itemDesc}.`);
		}

		// Confirm the buyer wants to buy
		const buyerConfirmationMsg = await msg.channel.send(
			`${buyerMember}, do you wish to buy ${itemDesc} from \`${msg.author.username}#${msg.author.discriminator}\` for ${priceDesc}? Say \`buy\` to confirm.`
		);

		try {
			await msg.channel.awaitMessages(
				_msg =>
					_msg.author.id === buyerMember.user.id && _msg.content.toLowerCase() === 'buy',
				options
			);
		} catch (err) {
			buyerConfirmationMsg.edit(`Cancelling sale of ${itemDesc}.`);
			return sellMsg.edit(`Cancelling sale of ${itemDesc}.`);
		}

		try {
			if (
				!(await msg.author.hasItem(osItem.id, quantity, false)) ||
				buyerMember.user.settings.get(UserSettings.GP) < price
			) {
				return msg.send(`One of you lacks the required GP or items to make this trade.`);
			}

			await buyerMember.user.removeGP(price);
			await msg.author.addGP(price);

			await msg.author.removeItemFromBank(osItem.id, quantity);
			await buyerMember.user.addItemsToBank({ [osItem.id]: quantity });
		} catch (err) {
			this.client.emit(Events.Wtf, err);
			return msg.send(`Fatal error occurred. Please seek help in the support server.`);
		}

		msg.author.log(
			`sold ${itemDesc} itemID[${osItem.id}] to ${buyerMember.user.sanitizedName} for ${price}`
		);

		return msg.send(`Sale of ${itemDesc} complete!`);
	}
}
