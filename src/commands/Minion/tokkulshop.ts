import { CommandStore, KlasaMessage } from 'klasa';
import { Monsters } from 'oldschooljs';
import { addBanks, bankHasAllItemsFromBank, removeBankFromBank } from 'oldschooljs/dist/util';

import { BotCommand } from '../../lib/BotCommand';
import TokkulShopItem from '../../lib/buyables/tokkulBuyables';
import { Time } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { ItemBank } from '../../lib/types';
import { stringMatches } from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import itemID from '../../lib/util/itemID';

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

		if (shopInventory.requireFireCape && msg.author.getKC(TzTokJad) < 1) {
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

		let outItems: ItemBank = {};
		let inItems: ItemBank = {};
		let itemString: string = '';
		let inItemString: string = '';
		if (type === 'buy') {
			outItems = { [itemID('Tokkul')]: quantity * shopInventory.tokkulCost! };
			inItems = { [shopInventory.inputItem]: quantity };
			itemString = await createReadableItemListFromBank(this.client, outItems);
			inItemString = await createReadableItemListFromBank(this.client, inItems);
		} else {
			outItems = { [shopInventory.inputItem]: quantity };
			inItems = { [itemID('Tokkul')]: quantity * shopInventory.tokkulReturn };
			itemString = await createReadableItemListFromBank(this.client, inItems);
			inItemString = await createReadableItemListFromBank(this.client, outItems);
		}

		if (!bankHasAllItemsFromBank(userBank, outItems)) {
			if (type === 'buy') {
				return msg.send(
					`I am sorry JalYt, but you don't have enough tokkul for that. You need **${itemString}** to buy **${inItemString}**.`
				);
			}
			return msg.send(
				`I am sorry JalYt, but you don't have enough items for that. You need **${inItemString}** to sell for **${itemString}**.`
			);
		}

		if (!msg.flagArgs.cf && !msg.flagArgs.confirm) {
			const sellMsg = await msg.channel.send(
				`${msg.author}, JalYt, say \`confirm\` to confirm that you want to ${
					type === 'buy' ? 'buy' : 'sell'
				} **${inItemString}** for **${itemString}**.`
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
					`Cancelling ${type === 'buy' ? 'purchase' : 'sale'} of **${inItemString}**.`
				);
			}
		}

		await msg.author.settings.update(
			UserSettings.Bank,
			addBanks([inItems, removeBankFromBank(userBank, outItems)])
		);

		return msg.send(
			`You ${type === 'buy' ? 'bought' : 'sold'} **${inItemString}** for **${itemString}**.`
		);
	}
}
