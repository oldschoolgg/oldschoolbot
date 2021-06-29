import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';
import { bankHasAllItemsFromBank } from 'oldschooljs/dist/util';

import TokkulShopItem from '../../lib/data/buyables/tokkulBuyables';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';

const { TzTokJad } = Monsters;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<buy|sell> [quantity:integer{1,2147483647}] <item:...string>',
			usageDelim: ' ',
			oneAtTime: true,
			cooldown: 5,
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

		if (type === 'sell' && msg.author.numItemsInBankSync(shopInventory.inputItem) === 0) {
			return msg.channel.send(`I am sorry JalYt. You don't have any **${shopInventory.name}** to sell me.`);
		}

		if (quantity === undefined) {
			quantity = type === 'sell' ? userBank[shopInventory.inputItem] : 1;
		}

		let outItems = new Bank();
		let inItems = new Bank();
		if (type === 'buy') {
			inItems.add({ Tokkul: quantity * shopInventory.tokkulCost! });
			outItems.add({ [shopInventory.inputItem]: quantity });
		} else {
			inItems.add({ [shopInventory.inputItem]: quantity });
			outItems.add({ Tokkul: quantity * shopInventory.tokkulReturn });
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

		await msg.confirm(
			`${msg.author}, JalYt, please confirm that you want to ${
				type === 'buy' ? 'buy' : 'sell'
			} **${items}** for **${tokkul}**.`
		);

		await msg.author.exchangeItemsFromBank({ lootBank: outItems, costBank: inItems, collectionLog: true });

		return msg.channel.send(`You ${type === 'buy' ? 'bought' : 'sold'} **${items}** for **${tokkul}**.`);
	}
}
