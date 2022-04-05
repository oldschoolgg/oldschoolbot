import { calcPercentOfNum } from 'e';
import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { Bank, Util } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { updateBankSetting, updateGPTrackSetting } from '../../lib/util';

export function sellPriceOfItem(client: KlasaClient, item: Item) {
	const customPrices = client.settings.get(ClientSettings.CustomPrices);
	let basePrice = customPrices[item.id] ?? item.price;
	if (basePrice > item.highalch * 3) {
		return basePrice;
	}
	return calcPercentOfNum(30, item.highalch);
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '(items:TradeableBank)',
			ironCantUse: true,
			categoryFlags: ['minion'],
			description: 'Sells an item to the bot.',
			examples: ['+sell bronze arrow']
		});
	}

	async run(msg: KlasaMessage, [[bankToSell]]: [[Bank, number]]) {
		let totalPrice = 0;
		for (const [item, qty] of bankToSell.items()) {
			totalPrice += sellPriceOfItem(this.client, item) * qty;
		}

		if (msg.author.isIronman) return msg.channel.send("Iron players can't sell items.");
		const hasSkipper = msg.author.usingPet('Skipper') || msg.author.bank().amount('Skipper') > 0;
		const taxRate = hasSkipper ? 0.15 : 0.25;
		const tax = Math.ceil(totalPrice * taxRate);
		totalPrice = Math.max(0, Math.floor(totalPrice - tax));

		await msg.confirm(
			`${
				msg.author
			}, please confirm you want to sell ${bankToSell} for **${totalPrice.toLocaleString()}** (${Util.toKMB(
				totalPrice
			)}).`
		);

		if (bankToSell.has('Coins')) {
			return msg.channel.send('You cant sell coins.');
		}

		await Promise.all([msg.author.removeItemsFromBank(bankToSell.bank), msg.author.addGP(totalPrice)]);

		updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceSellingItems, totalPrice);
		updateBankSetting(this.client, ClientSettings.EconomyStats.SoldItemsBank, bankToSell.bank);

		msg.author.log(`sold ${JSON.stringify(bankToSell.bank)} for ${totalPrice}`);

		return msg.channel.send(
			`Sold ${bankToSell} for **${totalPrice.toLocaleString()}** GP (${Util.toKMB(
				totalPrice
			)}).  Tax: ${tax.toLocaleString()} ${
				hasSkipper
					? '\n\n<:skipper:755853421801766912> Skipper has negotiated with the bank and you were charged less tax on the sale!'
					: ''
			}`
		);
	}
}
