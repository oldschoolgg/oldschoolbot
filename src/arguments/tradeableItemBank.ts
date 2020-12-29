import { objectEntries } from 'e';
import { Argument, ArgumentStore, KlasaMessage, Possible } from 'klasa';
import { Bank } from 'oldschooljs';

import { bankHasAllItemsFromBank } from '../lib/util';
import getOSItem from '../lib/util/getOSItem';
import itemIsTradeable from '../lib/util/itemIsTradeable';
import { ItemResult, parseStringBank } from '../lib/util/parseStringBank';

export type TradeableItemBankArgumentType = [Bank, number, Bank];

export default class TradeableItemBankArgument extends Argument {
	public constructor(store: ArgumentStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'TradeableBank' });
	}

	async run(arg: string, _: Possible, msg: KlasaMessage): Promise<TradeableItemBankArgumentType> {
		await msg.author.settings.sync(true);
		let items: ItemResult[] = [];
		try {
			items = parseStringBank(arg);
		} catch (err) {
			throw err;
		}
		let bank = new Bank();

		const invalidBank = new Bank();
		const userBank = msg.author.bank();
		if (msg.flagArgs.all) {
			let res: ItemResult[] = objectEntries(userBank.bank).map(ent => ({
				item: getOSItem(ent[0]),
				qty: ent[1]
			}));
			items = items.concat(res);
		}

		if (items.length === 0) {
			throw "You didn't write any items for the command to use, for example: `5k monkfish, 20 trout`.";
		}

		let totalPrice = 0;
		for (const item of items) {
			const { id } = item.item;
			if (bank.length === 70) break;
			const qty = item.qty === 0 ? Math.max(1, userBank.amount(id)) : item.qty;
			if (itemIsTradeable(id) && userBank.amount(id) >= qty) {
				bank.add(id, qty);
				totalPrice += (await this.client.fetchItemPrice(id)) * qty;
			} else {
				invalidBank.add(id, item.qty);
			}
		}
		const keys = Object.keys(bank.bank);
		if (keys.length === 0) {
			throw `You don't have enough of the items you provided, or none of them are tradeable.`;
		}
		if (!bankHasAllItemsFromBank(userBank.bank, bank.bank)) {
			throw "Wtf!!!! User bank doesn't have all items in the target bank";
		}
		return [bank, totalPrice, invalidBank];
	}
}
