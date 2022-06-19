import { calcPercentOfNum, reduceNumByPercent } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Util } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { MAX_INT_JAVA } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { NestBoxesTable } from '../../lib/simulation/misc';
import { BotCommand } from '../../lib/structures/BotCommand';
import { clamp, itemID as id, updateBankSetting, updateGPTrackSetting } from '../../lib/util';

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

export function sellPriceOfItem(item: Item, taxRate = 25): { price: number; basePrice: number } {
	if (!item.price) return { price: 0, basePrice: 0 };
	const customPrices = globalClient.settings.get(ClientSettings.CustomPrices);
	let basePrice = customPrices[item.id] ?? item.price;
	let price = basePrice;
	price = reduceNumByPercent(price, taxRate);
	price = Math.floor(price);
	if (price < (item.highalch ?? 0) * 3) {
		price = Math.floor(calcPercentOfNum(30, item.highalch!));
	}
	price = clamp(Math.floor(price), 0, MAX_INT_JAVA);
	return { price, basePrice };
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '(items:TradeableBank)',
			categoryFlags: ['minion'],
			description: 'Sells an item to the bot.',
			examples: ['+sell bronze arrow']
		});
	}

	async run(msg: KlasaMessage, [[bankToSell]]: [[Bank, number]]) {
		if (bankToSell.has('mole claw') || bankToSell.has('mole skin')) {
			const moleBank = new Bank();
			if (bankToSell.has('Mole claw')) {
				moleBank.add('Mole claw', bankToSell.amount('Mole claw'));
			}
			if (bankToSell.has('Mole skin')) {
				moleBank.add('Mole skin', bankToSell.amount('Mole skin'));
			}
			const loot = new Bank();
			for (let i = 0; i < moleBank.amount('Mole claw') + moleBank.amount('Mole skin'); i++) {
				loot.add(NestBoxesTable.roll());
			}
			await msg.author.removeItemsFromBank(moleBank);
			await msg.author.addItemsToBank({ items: loot, collectionLog: true });
			return msg.channel.send(`You exchanged ${moleBank} and received: ${loot}.`);
		}

		let totalPrice = 0;

		const hasSkipper = msg.author.usingPet('Skipper') || msg.author.bank().amount('Skipper') > 0;
		const taxRatePercent = hasSkipper ? 15 : 25;

		for (const [item, qty] of bankToSell.items()) {
			const specialPrice = specialSoldItems.get(item.id);
			if (specialPrice) {
				totalPrice += Math.floor(specialPrice * qty);
			} else {
				if (msg.author.isIronman) return msg.channel.send("Iron players can't sell items.");
				const { price } = sellPriceOfItem(item, taxRatePercent);
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

		if (bankToSell.has('Coins')) {
			return msg.channel.send("You can't sell coins.");
		}

		await msg.author.removeItemsFromBank(bankToSell.bank);
		await msg.author.addItemsToBank({ items: new Bank().add('Coins', totalPrice) });

		updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceSellingItems, totalPrice);
		updateBankSetting(this.client, ClientSettings.EconomyStats.SoldItemsBank, bankToSell.bank);

		msg.author.log(`sold ${JSON.stringify(bankToSell.bank)} for ${totalPrice}`);

		return msg.channel.send(
			`Sold ${bankToSell} for **${totalPrice.toLocaleString()}gp (${Util.toKMB(
				totalPrice
			)})** (${taxRatePercent}% below market price) ${
				hasSkipper
					? '\n\n<:skipper:755853421801766912> Skipper has negotiated with the bank and you were charged less tax on the sale!'
					: ''
			}`
		);
	}
}
