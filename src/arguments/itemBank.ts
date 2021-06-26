import { Argument, ArgumentStore, KlasaMessage, Possible } from 'klasa';
import { Bank } from 'oldschooljs';

import { parseStringBank } from '../lib/util/parseStringBank';

export default class extends Argument {
	public constructor(store: ArgumentStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'Bank' });
	}

	run(arg: string, _: Possible, message: KlasaMessage): Bank {
		const items = parseStringBank(arg);
		let bank = new Bank();
		const userBank = message.author.bank();
		for (const [item, qty] of items) {
			bank.add(item.id, qty === 0 ? Math.max(1, userBank.amount(item.id)) : qty);
		}
		const keys = Object.keys(bank.bank);
		if (keys.length === 0) {
			throw new Error('Please input some items.');
		}
		return bank;
	}
}
