import { objectEntries } from 'e';
import numbro from 'numbro';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { MAX_INT_JAVA } from '../constants';
import { filterableTypes } from '../data/filterables';
import { bankHasAllItemsFromBank, cleanMentions, shuffle, stringMatches } from '../util';
import getOSItem from './getOSItem';

export interface ItemResult {
	qty: number;
	item: Item;
}

function parseQuantityAndItem(str = ''): ItemResult | null {
	str = str.trim();
	if (!str) return null;
	let [potentialQty, ...potentialName] = str.split(' ');
	// Fix for 3rd age items
	if (potentialQty === '3rd') potentialQty = '';
	let parsedQty = numbro(potentialQty).value() as number | undefined;
	// Can return number, NaN or undefined. We want it to be only number or undefined.
	if (parsedQty !== undefined && isNaN(parsedQty)) parsedQty = undefined;
	const parsedName = parsedQty === undefined ? str : potentialName.join('');

	let osItem: Item | undefined = undefined;
	try {
		osItem = getOSItem(parsedName);
	} catch (_) {
		throw new Error(`\`${cleanMentions(null, parsedName)}\` is not a valid item name`);
	}
	let quantity = parsedQty ?? 0;
	if (quantity < 0) quantity = 0;

	quantity = Math.floor(Math.min(MAX_INT_JAVA, quantity));

	return { item: osItem, qty: quantity };
}

export function parseStringBank(str = ''): ItemResult[] {
	str = str.trim().replace(/\s\s+/g, ' ');
	if (!str) return [];
	const split = str.split(',');
	if (split.length === 0) return [];
	let items: ItemResult[] = [];
	for (let i = 0; i < split.length; i++) {
		let res = parseQuantityAndItem(split[i]);
		if (res !== null && !items.some(i => i.item === res!.item)) {
			items.push(res);
		}
	}
	return items;
}

interface RichStringBankOptions {
	userBank?: Bank;
	favorites?: number[];
	str: string;
	flags?: Record<string, string>;
	type: 'tradeables' | 'untradeables' | 'equippables' | 'any';
	owned?: boolean;
}

export function parseRichStringBank({
	str,
	flags = {},
	userBank = new Bank(),
	type,
	owned = false,
	favorites = []
}: RichStringBankOptions): Bank {
	let items: ItemResult[] = parseStringBank(str);

	let bank = new Bank();

	let parsedQtyOverride = parseInt(flags.qty);
	const qtyOverride: number | null = isNaN(parsedQtyOverride) ? null : parsedQtyOverride;
	if (qtyOverride !== null && (qtyOverride < 1 || qtyOverride > MAX_INT_JAVA)) {
		throw new Error(`The quantity override you gave was too low, or too high.`);
	}

	// Adds every non-favorited item
	if (flags.all) {
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
	for (const flag of Object.keys(flags)) {
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
		throw new Error(
			"You didn't write any items for the command to use, for example: `5k monkfish, 20 trout`."
		);
	}

	for (const item of items) {
		const { id } = item.item;
		if (bank.length === 70) break;
		const qty = qtyOverride ?? (item.qty === 0 ? Math.max(1, userBank.amount(id)) : item.qty);

		if (type === 'tradeables' && !item.item.tradeable) continue;
		if (type === 'untradeables' && item.item.tradeable) continue;
		if (type === 'equippables' && !item.item.equipment?.slot) continue;
		if (owned && userBank.amount(id) < qty) continue;
		bank.add(id, qty);
	}
	if (owned && !bankHasAllItemsFromBank(userBank.bank, bank.bank)) {
		throw new Error("User bank doesn't have all items in the target bank");
	}
	return bank;
}
