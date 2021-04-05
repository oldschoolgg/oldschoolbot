import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';
import { addBanks, bankHasAllItemsFromBank, removeBankFromBank } from 'oldschooljs/dist/util';

import { Time } from '../../lib/constants';
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
			return msg.send(
				`I don't recognize that item JalYt, here are my wares: ${TokkulShopItem.map(
					item => {
						return item.name;
					}
				).join(', ')}.`
			);
		}

		if (shopInventory.requireFireCape && msg.author.getKC(TzTokJad.id) < 1) {
			return msg.send(
				`You are not worthy JalYt. Before you can ${type} an ${shopInventory.name}, you need to have defeated the might TzTok-Jad!`
			);
		}

		if (!shopInventory.tokkulCost && type === 'buy') {
			return msg.send(
				`I am sorry JalYt, but I can't sell you that. Here are the items I can sell: ${TokkulShopItem.filter(
					item => item.tokkulCost
				)
					.map(item => item.name)
					.join(', ')}.`
			);
		}

		if (type === 'sell' && msg.author.numItemsInBankSync(shopInventory.inputItem) === 0) {
			return msg.send(
				`I am sorry JalYt. You don't have any **${shopInventory.name}** to sell me.`
			);
		}

		if (quantity === undefined) {
			quantity = type === 'sell' ? userBank[shopInventory.inputItem] : 1;
		}

		let outItems = new Bank();
		let inItems = new Bank();
		if (type === 'buy') {
			outItems.add({ Tokkul: quantity * shopInventory.tokkulCost! });
			inItems.add({ [shopInventory.inputItem]: quantity });
		} else {
			outItems.add({ [shopInventory.inputItem]: quantity });
			inItems.add({ Tokkul: quantity * shopInventory.tokkulReturn });
		}

		if (!bankHasAllItemsFromBank(userBank, outItems.bank)) {
			if (type === 'buy') {
				return msg.send(
					`I am sorry JalYt, but you don't have enough tokkul for that. You need **${inItems}** to buy **${outItems}**.`
				);
			}
			return msg.send(
				`I am sorry JalYt, but you don't have enough items for that. You need **${inItems}** to sell for **${outItems}**.`
			);
		}

		if (!msg.flagArgs.cf && !msg.flagArgs.confirm) {
			const sellMsg = await msg.channel.send(
				`${msg.author}, JalYt, say \`confirm\` to confirm that you want to ${
					type === 'buy' ? 'buy' : 'sell'
				} **${inItems}** for **${outItems}**.`
			);

			// Confirm the user wants to buy
			try {
				await msg.channel.awaitMessages(
					_msg =>
						_msg.author.id === msg.author.id &&
						_msg.content.toLowerCase() === 'confirm',
					{
						max: 1,
						time: Time.Second * 15,
						errors: ['time']
					}
				);
			} catch (err) {
				return sellMsg.edit(
					`Cancelling ${type === 'buy' ? 'purchase' : 'sale'} of **${outItems}**.`
				);
			}
		}

		await msg.author.settings.update(
			UserSettings.Bank,
			addBanks([outItems.bank, removeBankFromBank(userBank, inItems.bank)])
		);

		return msg.send(
			`You ${type === 'buy' ? 'bought' : 'sold'} **${outItems}** for **${inItems}**.`
		);
	}
}
