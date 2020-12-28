import { objectEntries } from 'e';
import { Argument, ArgumentStore, KlasaMessage, Possible } from 'klasa';
import { Bank } from 'oldschooljs';

import getOSItem from '../lib/util/getOSItem';
import itemIsTradeable from '../lib/util/itemIsTradeable';
import { ItemResult, parseStringBank } from '../lib/util/parseStringBank';

export default class extends Argument {
	public constructor(store: ArgumentStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'TradeableBank' });
	}

	async run(arg: string, _: Possible, msg: KlasaMessage): Promise<[Bank, number, Bank]> {
		const {
			args,
			usage: { usageDelim }
		} = msg['prompter']!;
		const index = args.indexOf(arg);
		arg = args.splice(index, args.length - index).join(usageDelim ?? '');

		await msg.author.settings.sync(true);
		let items = parseStringBank(arg);
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

		let totalPrice = 0;
		for (const item of items) {
			const { id } = item.item;
			if (bank.length === 70) break;
			if (itemIsTradeable(id) && userBank.amount(id) >= item.qty) {
				const qty = item.qty === 0 ? Math.max(1, userBank.amount(id)) : item.qty;
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
		return [bank, totalPrice, invalidBank];
	}
}
