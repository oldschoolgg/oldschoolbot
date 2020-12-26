import { Argument, ArgumentStore, KlasaMessage, Possible } from 'klasa';

import { ItemResult, parseStringBank } from '../lib/util/parseStringBank';

export default class extends Argument {
	public constructor(store: ArgumentStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'BankArray' });
	}

	run(arg: string, _: Possible, message: KlasaMessage): ItemResult[] {
		const items = parseStringBank(arg);
		let newItems: ItemResult[] = [];
		const userBank = message.author.bank();
		for (const item of items) {
			const { id } = item.item;
			newItems.push({
				item: item.item,
				qty: item.qty === 0 ? Math.max(1, userBank.amount(id)) : item.qty
			});
		}
		if (newItems.length === 0) {
			throw 'Please input some items.';
		}
		return newItems;
	}
}
