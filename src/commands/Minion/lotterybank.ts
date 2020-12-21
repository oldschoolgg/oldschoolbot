import { CommandStore, KlasaMessage } from 'klasa';
import { Item } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/BotCommand';
import { Events } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { addItemToBank, calcPercentOfNum, itemID } from '../../lib/util';
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
			oneAtTime: true,
			categoryFlags: ['minion'],
			description: 'Sacrifices items from your bank.',
			examples: ['+sacrifice 1 Elysian sigil']
		});
	}

	async run(msg: KlasaMessage, [quantity, itemArray]: [number | undefined, Item[]]) {
		if (!itemArray) {
			return msg.send(`Please specify an item.`);
		}

		const userBank = msg.author.settings.get(UserSettings.Bank);
		const osItem = itemArray.find(i => userBank[i.id]);

		if (!osItem) {
			return msg.send(`You don't have any of this item.`);
		}

		const numItemsHas = userBank[osItem.id];
		if (!quantity) {
			quantity = numItemsHas;
		}

		if (quantity > numItemsHas) {
			return msg.send(`You dont have ${quantity}x ${osItem.name}.`);
		}

		let priceOfItem = itemIsTradeable(osItem.id)
			? await this.client.fetchItemPrice(osItem.id)
			: 1;

		const totalPrice = priceOfItem * quantity;

		let amountOfTickets = Math.floor(totalPrice / 10_000_000);

		if (amountOfTickets < 1) {
			return msg.send(`Those items aren't worth enough.`);
		}

		const wasAlready = Boolean(this.client.settings.get(ClientSettings.BankLottery)[osItem.id]);
		let bonusTickets = 0;
		if (!wasAlready) {
			bonusTickets = Math.floor(calcPercentOfNum(15, amountOfTickets));
			amountOfTickets += bonusTickets;
		}

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			let str = `${msg.author}, say \`confirm\` to commit ${quantity}x ${osItem.name} to the bank lottery - you'll receive ${amountOfTickets} bank lottery tickets.`;
			if (bonusTickets > 0) {
				str += `\n\nYou're getting ${bonusTickets}x Bonus Tickets for sacrificing something that nobody has before.`;
			}
			const sellMsg = await msg.channel.send(str);

			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					options
				);
			} catch (err) {
				return sellMsg.edit(
					`Cancelling bank lottery sacrifice of ${quantity}x ${osItem.name}.`
				);
			}
		}

		if (totalPrice > 200_000_000) {
			this.client.emit(
				Events.ServerNotification,
				`${msg.author.username} just committed ${quantity}x ${osItem.name} to the Bank Lottery!`
			);
		}

		await msg.author.addItemsToBank({ [itemID('Bank lottery ticket')]: amountOfTickets }, true);
		await msg.author.removeItemFromBank(osItem.id, quantity);

		await this.client.settings.update(
			ClientSettings.BankLottery,
			addItemToBank(this.client.settings.get(ClientSettings.BankLottery), osItem.id, quantity)
		);

		return msg.send(
			`You commited ${quantity}x ${osItem.name} to the bank lottery, and received ${amountOfTickets}x bank lottery tickets.`
		);
	}
}
