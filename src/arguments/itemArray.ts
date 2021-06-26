import { Argument, ArgumentStore, KlasaMessage, Possible } from 'klasa';
import { Item } from 'oldschooljs/dist/meta/types';

import { parseStringBank } from '../lib/util/parseStringBank';

export default class extends Argument {
	public constructor(store: ArgumentStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'BankArray' });
	}

	run(arg: string, _: Possible, message: KlasaMessage): [Item, number][] {
		const items = parseStringBank(arg);
		let newItems: [Item, number][] = [];
		const userBank = message.author.bank();
		for (const [item, qty] of items) {
			newItems.push([item, qty === 0 ? Math.max(1, userBank.amount(item.id)) : qty]);
		}
		if (newItems.length === 0) {
			throw 'Please input some items.';
		}
		return newItems;
	}
}
