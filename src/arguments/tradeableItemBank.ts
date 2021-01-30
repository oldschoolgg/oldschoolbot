import { objectEntries } from 'e';
import { Argument, ArgumentStore, KlasaMessage, Possible } from 'klasa';
import { Bank } from 'oldschooljs';

import { MAX_INT_JAVA } from '../lib/constants';
import { filterableTypes } from '../lib/data/filterables';
import { UserSettings } from '../lib/settings/types/UserSettings';
import { bankHasAllItemsFromBank, shuffle, stringMatches } from '../lib/util';
import getOSItem from '../lib/util/getOSItem';
import { ItemResult, parseStringBank } from '../lib/util/parseStringBank';

export type TradeableItemBankArgumentType = [Bank, number, Bank];

export default class TradeableItemBankArgument extends Argument {
	public constructor(store: ArgumentStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'TradeableBank' });
	}

	async run(arg: string, _: Possible, msg: KlasaMessage): Promise<TradeableItemBankArgumentType> {
		await msg.author.settings.sync(true);
		let items: ItemResult[] = parseStringBank(arg);

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
			const entries = shuffle(objectEntries(userBank.bank));
			for (let i = 0; i < entries.length; i++) {
				let [id, qty] = entries[i];
				id = Number(id);
				const item = {
					item: getOSItem(id),
					qty: qtyOverride ?? qty
				};
				if (!favorites.includes(id) && !items.some(i => i.item === item.item)) {
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
					items.push({ item: getOSItem(item), qty: qtyOverride ?? 0 });
				}
			}
		}

		if (items.length === 0) {
			throw "You didn't write any items for the command to use, for example: `5k monkfish, 20 trout`.";
		}

		let totalPrice = 0;
		for (const item of items) {
			const { id } = item.item;
			if (bank.length === 70) break;
			const qty =
				qtyOverride ?? (item.qty === 0 ? Math.max(1, userBank.amount(id)) : item.qty);

			if (userBank.amount(id) >= qty) {
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
			this.client.wtf(
				new Error(`${msg.author.sanitizedName} doesn't have all items in target bank`)
			);
			throw "User bank doesn't have all items in the target bank";
		}
		return [bank, totalPrice, invalidBank];
	}
}
