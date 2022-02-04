import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';
import { addBanks, bankHasAllItemsFromBank, removeBankFromBank } from 'oldschooljs/dist/util';

import TokkulShopItem from '../../lib/data/buyables/tokkulBuyables';
import { KaramjaDiary, userhasDiaryTier } from '../../lib/diaries';
import { addToBuyLimitBank, getBuyLimitBank } from '../../lib/settings/settings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';
import { buyLimit } from '../../lib/util/buyLimit';
import getOSItem from '../../lib/util/getOSItem';

const { TzTokJad } = Monsters;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<buy|sell> [quantity:integer{1,100000}] <item:...string>',
			usageDelim: ' ',
			altProtection: true,
			aliases: ['tks'],
			categoryFlags: ['minion'],
			description: 'Allows you to buy and sell items to the Tzhaar Tokkul shop.',
			examples: ['+tks buy Obsidian platebody', '+tks sell 5k Chaos rune']
		});
	}

	async run(msg: KlasaMessage, [type = 'buy', quantity, name]: ['buy' | 'sell', number, string]) {
		await msg.author.settings.sync(true);

		const userBank = msg.author.settings.get(UserSettings.Bank);

		const shopInventory = TokkulShopItem.find(
			item =>
				stringMatches(name, item.name) ||
				(item.aliases && item.aliases.some(alias => stringMatches(alias, name)))
		);

		if (!shopInventory) {
			return msg.channel.send(
				`I don't recognize that item JalYt, here are my wares: ${TokkulShopItem.map(item => {
					return item.name;
				}).join(', ')}.`
			);
		}

		if (shopInventory.requireFireCape && msg.author.getKC(TzTokJad.id) < 1) {
			return msg.channel.send(
				`You are not worthy JalYt. Before you can ${type} an ${shopInventory.name}, you need to have defeated the might TzTok-Jad!`
			);
		}

		if (!shopInventory.tokkulCost && type === 'buy') {
			return msg.channel.send(
				`I am sorry JalYt, but I can't sell you that. Here are the items I can sell: ${TokkulShopItem.filter(
					item => item.tokkulCost
				)
					.map(item => item.name)
					.join(', ')}.`
			);
		}

		if (type === 'sell' && msg.author.bank().amount(shopInventory.inputItem) === 0) {
			return msg.channel.send(`I am sorry JalYt. You don't have any **${shopInventory.name}** to sell me.`);
		}

		if (quantity === undefined) {
			quantity = type === 'sell' ? userBank[shopInventory.inputItem] : 1;
			quantity = Math.min(10_000, quantity);
		}

		let outItems = new Bank();
		let inItems = new Bank();

		const [hasKaramjaDiary] = await userhasDiaryTier(msg.author, KaramjaDiary.easy);
		const tokkulCost = hasKaramjaDiary ? shopInventory.diaryTokkulCost : shopInventory.tokkulCost;
		const tokkulReturn = hasKaramjaDiary ? shopInventory.diaryTokkulReturn : shopInventory.tokkulReturn;

		if (type === 'buy') {
			let qty = quantity;
			let cost = quantity * tokkulCost!;
			if (shopInventory.buyLimitFactor && shopInventory.tokkulCost) {
				const { amountToBuy, finalCost } = buyLimit({
					buyLimitBank: await getBuyLimitBank(msg.author),
					increaseFactor: shopInventory.buyLimitFactor,
					itemBeingBought: getOSItem(shopInventory.inputItem),
					quantityBeingBought: quantity,
					baseCost: shopInventory.tokkulCost,
					absoluteLimit: Infinity
				});
				qty = amountToBuy;
				cost = finalCost;
			}
			inItems.add({ Tokkul: cost });
			outItems.add({ [shopInventory.inputItem]: qty });
		} else {
			inItems.add({ [shopInventory.inputItem]: quantity });
			outItems.add({ Tokkul: quantity * tokkulReturn! });
		}

		// Buy: inItems = tokkul, outItems = item
		// Sell: inItems = item, outItems = tokkul

		const tokkul = type === 'buy' ? inItems : outItems;
		const items = type === 'buy' ? outItems : inItems;

		if (!bankHasAllItemsFromBank(userBank, inItems.bank)) {
			if (type === 'buy') {
				return msg.channel.send(
					`I am sorry JalYt, but you don't have enough tokkul for that. You need **${tokkul}** to buy **${items}**.`
				);
			}
			return msg.channel.send(
				`I am sorry JalYt, but you don't have enough items for that. You need **${items}** to sell for **${tokkul}**.`
			);
		}

		delete msg.flagArgs.cf;
		delete msg.flagArgs.confirm;
		await msg.confirm(
			`${msg.author}, JalYt, please confirm that you want to ${
				type === 'buy' ? 'buy' : 'sell'
			} **${items}** for **${tokkul}**.`
		);

		await msg.author.settings.update(
			UserSettings.Bank,
			addBanks([outItems.bank, removeBankFromBank(userBank, inItems.bank)])
		);

		if (type === 'buy' && shopInventory.buyLimitFactor && shopInventory.tokkulCost) {
			await addToBuyLimitBank(msg.author, outItems);
		}

		return msg.channel.send(`You ${type === 'buy' ? 'bought' : 'sold'} **${items}** for **${tokkul}**.`);
	}
}
