import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Util } from 'oldschooljs';

import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { itemID as id, updateBankSetting, updateGPTrackSetting } from '../../lib/util';

/**
 * - Hardcoded prices
 * - Can be sold by ironmen
 */
const specialSoldItems = new Map([
	[id('Ancient emblem'), 500_000],
	[id('Ancient totem'), 1_000_000],
	[id('Ancient statuette'), 2_000_000],
	[id('Ancient medallion'), 4_000_000],
	[id('Ancient effigy'), 8_000_000],
	[id('Ancient relic'), 16_000_000]
]);

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '(items:TradeableBank)',
			categoryFlags: ['minion'],
			description: 'Sells an item to the bot for 80% of G.E price.',
			examples: ['+sell bronze arrow']
		});
	}

	async run(msg: KlasaMessage, [[bankToSell]]: [[Bank, number]]) {
		let totalPrice = 0;
		const customPrices = this.client.settings.get(ClientSettings.CustomPrices);
		for (const [item, qty] of bankToSell.items()) {
			const specialPrice = specialSoldItems.get(item.id);
			if (specialPrice) {
				totalPrice += Math.floor(specialPrice * qty);
			} else {
				if (msg.author.isIronman) return msg.channel.send("Iron players can't sell items.");
				const price = customPrices[item.id] ?? item.price;
				totalPrice += price * qty;
			}
		}

		await msg.confirm(
			`${
				msg.author
			}, please confirm you want to sell ${bankToSell} for **${totalPrice.toLocaleString()}** (${Util.toKMB(
				totalPrice
			)}).`
		);

		const tax = Math.ceil((totalPrice / 0.8) * 0.2);

		await Promise.all([msg.author.removeItemsFromBank(bankToSell.bank), msg.author.addGP(totalPrice)]);

		updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceSellingItems, totalPrice);
		updateBankSetting(this.client, ClientSettings.EconomyStats.SoldItemsBank, bankToSell.bank);

		msg.author.log(`sold ${JSON.stringify(bankToSell.bank)} for ${totalPrice}`);

		return msg.channel.send(
			`Sold ${bankToSell} for **${totalPrice.toLocaleString()}gp (${Util.toKMB(totalPrice)})**. Tax: ${Util.toKMB(
				tax
			)}`
		);
	}
}
