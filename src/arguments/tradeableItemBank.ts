import { objectEntries, shuffleArr } from 'e';
import { Argument, ArgumentStore, KlasaMessage, Possible } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { MAX_INT_JAVA } from '../lib/constants';
import { filterableTypes } from '../lib/data/filterables';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { stringMatches } from '../lib/util';
import getOSItem from '../lib/util/getOSItem';
import { parseStringBank } from '../lib/util/parseStringBank';

export type TradeableItemBankArgumentType = [Bank, number, Bank];

export default class TradeableItemBankArgument extends Argument {
	public constructor(store: ArgumentStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'TradeableBank' });
	}

	async run(arg: string, _: Possible, msg: KlasaMessage): Promise<TradeableItemBankArgumentType> {
		await msg.author.settings.sync(true);
		let items: [Item, number][] = parseStringBank(arg);

		let bank = new Bank();

		const invalidBank = new Bank();
		const userBank = msg.author.bank();
		const favorites = msg.author.settings.get(UserSettings.FavoriteItems);

		let parsedQtyOverride = parseInt(msg.flagArgs.qty);
		const qtyOverride: number | null = isNaN(parsedQtyOverride) ? null : parsedQtyOverride;
		if (qtyOverride !== null && (qtyOverride < 1 || qtyOverride > MAX_INT_JAVA)) {
			throw `The quantity override you gave was too low, or too high.`;
		}

		// Adds every non-favorited item
		if (msg.flagArgs.all) {
			const entries = shuffleArr(objectEntries(userBank.bank));
			for (let i = 0; i < entries.length; i++) {
				let [id, qty] = entries[i];
				id = Number(id);
				const item: [Item, number] = [getOSItem(id), qtyOverride ?? qty];
				if (!favorites.includes(id) && !items.some(i => i[0] === item[0])) {
					items.push(item);
				}
			}
		}

		// Add filterables
		for (const flag of Object.keys(msg.flagArgs)) {
			const matching = filterableTypes.find(type =>
				type.aliases.some(alias => stringMatches(alias, flag))
			);
			if (matching) {
				for (const item of matching.items) {
					items.push([getOSItem(item), qtyOverride ?? 0]);
				}
			}
		}

		const { search } = msg.flagArgs;
		if (search) {
			items = [
				...items,
				...userBank
					.items()
					.filter(i => i[0].name.toLowerCase().includes(search.toLowerCase()))
			];
		}

		if (items.length === 0) {
			throw "You didn't write any items for the command to use, for example: `5k monkfish, 20 trout`.";
		}

		let totalPrice = 0;
		for (const [item, _qty] of items) {
			if (bank.length === 70) break;
			const qty = Math.max(
				1,
				qtyOverride ?? (_qty === 0 ? Math.max(1, userBank.amount(item.id)) : _qty)
			);

			if (userBank.amount(item.id) >= qty && item.id !== 995) {
				bank.add(item.id, qty);
				totalPrice += item.price * qty;
			} else {
				invalidBank.add(item.id, qty);
			}
		}
		const keys = Object.keys(bank.bank);
		if (keys.length === 0) {
			throw `You don't have enough of the items you provided, or none of them are tradeable.`;
		}
		if (!userBank.fits(bank)) {
			throw "User bank doesn't have all items in the target bank";
		}
		return [bank, totalPrice, invalidBank];
	}
}
