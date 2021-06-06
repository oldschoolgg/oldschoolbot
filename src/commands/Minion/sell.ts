import { calcPercentOfNum } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Util } from 'oldschooljs';

import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { itemID, updateBankSetting, updateGPTrackSetting } from '../../lib/util';

const options = {
	max: 1,
	time: 10_000,
	errors: ['time']
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 3,
			usage: '(items:TradeableBank)',
			oneAtTime: true,
			ironCantUse: true,
			categoryFlags: ['minion'],
			description: 'Sells an item to the bot.',
			examples: ['+sell bronze arrow']
		});
	}

	async run(msg: KlasaMessage, [[bankToSell]]: [[Bank, number]]) {
		let totalPrice = 0;
		for (const [item, qty] of bankToSell.items()) {
			if (item.price > item.highalch * 3) {
				totalPrice += item.price * qty;
			} else {
				totalPrice += calcPercentOfNum(30, item.highalch) * qty;
			}
		}

		if (msg.author.isIronman) return msg.send(`Iron players can't sell items.`);
		const hasSkipper =
			msg.author.equippedPet() === itemID('Skipper') ||
			msg.author.numItemsInBankSync(itemID('Skipper')) > 0;
		const tax = hasSkipper ? 0 : Math.ceil((totalPrice / 0.8) * 0.2);
		totalPrice = hasSkipper ? totalPrice : Math.floor(totalPrice * 0.8);

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const sellMsg = await msg.channel.send(
				`${
					msg.author
				}, say \`confirm\` to sell ${bankToSell} for **${totalPrice.toLocaleString()}** (${Util.toKMB(
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

		if (bankToSell.has('Coins')) {
			return msg.send(`You cant sell coins.`);
		}

		await Promise.all([
			msg.author.removeItemsFromBank(bankToSell.bank),
			msg.author.addGP(totalPrice)
		]);

		updateGPTrackSetting(
			this.client,
			ClientSettings.EconomyStats.GPSourceSellingItems,
			totalPrice
		);
		updateBankSetting(this.client, ClientSettings.EconomyStats.SoldItemsBank, bankToSell.bank);

		msg.author.log(`sold ${JSON.stringify(bankToSell.bank)} for ${totalPrice}`);

		return msg.send(
			`Sold ${bankToSell} for **${totalPrice.toLocaleString()}** GP (${Util.toKMB(
				totalPrice
			)}).  Tax: ${tax.toLocaleString()} ${
				hasSkipper
					? `\n\n<:skipper:755853421801766912> Skipper has negotiated with the bank and you weren't charged any tax on the sale!`
					: ''
			}`
		);
	}
}
