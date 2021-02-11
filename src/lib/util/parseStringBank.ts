import { objectEntries, shuffleArr } from 'e';
import numbro from 'numbro';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { client } from '../..';
import { MAX_INT_JAVA } from '../constants';
import { filterableTypes } from '../data/filterables';
import { bankHasAllItemsFromBank, cleanMentions, stringMatches } from '../util';
import getOSItem from './getOSItem';

function parseQuantityAndItem(str = ''): [Item, number] | null {
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

	return [osItem, quantity];
}

export function parseStringBank(str = ''): [Item, number][] {
	str = str.trim().replace(/\s\s+/g, ' ');
	if (!str) return [];
	const split = str.split(',');
	if (split.length === 0) return [];
	let items: [Item, number][] = [];
	for (let i = 0; i < split.length; i++) {
		let res = parseQuantityAndItem(split[i]);
		if (res !== null && !items.some(i => i[0] === res![0])) {
			items.push(res);
		}
	}
	return items;
}

export const RichBankTypes = ['any', 'tradeables', 'untradeables', 'equippables'] as const;

interface RichStringBankOptions {
	userBank?: Bank;
	favorites?: readonly number[];
	input: string | Bank;
	flags?: Record<string, string>;
	type: typeof RichBankTypes[number];
	owned?: boolean;
	maxLength?: number;
}

export function parseRichStringBank({
	input,
	flags = {},
	userBank = new Bank(),
	type,
	owned = false,
	favorites = [],
	maxLength = Infinity
}: RichStringBankOptions): Bank {
	let items: [Item, number][] =
		typeof input === 'string' ? parseStringBank(input) : input.items();

	let bank = new Bank();

	let parsedQtyOverride = parseInt(flags.qty);
	const qtyOverride: number | null = isNaN(parsedQtyOverride) ? null : parsedQtyOverride;
	if (qtyOverride !== null && (qtyOverride < 1 || qtyOverride > MAX_INT_JAVA)) {
		throw new Error(`The quantity override you gave was too low, or too high.`);
	}

	// Adds every non-favorited item
	if (flags.all) {
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
	for (const flag of Object.keys(flags)) {
		const matching = filterableTypes.find(type =>
			type.aliases.some(alias => stringMatches(alias, flag))
		);
		if (matching) {
			for (const item of matching.items) {
				items.push([getOSItem(item), qtyOverride ?? 0]);
			}
		}
	}

	if (items.length === 0) {
		throw new Error(
			"You didn't write any items for the command to use, for example: `5k monkfish, 20 trout`."
		);
	}

	const over = numbro(flags.over).value() ?? -1;

	for (const [item, _qty] of items) {
		if (bank.length === maxLength) break;
		const qty = qtyOverride ?? (_qty === 0 ? Math.max(1, userBank.amount(item.id)) : _qty);
		const stackPrice = client.syncItemPrice(item.id) * qty;

		if (stackPrice < over) continue;

		if (type === 'tradeables' && !item.tradeable) continue;
		if (type === 'untradeables' && item.tradeable) continue;
		if (type === 'equippables' && !item.equipment?.slot) continue;
		if (owned && userBank.amount(item.id) < qty) continue;
		bank.add(item.id, qty);
	}
	if (owned && !bankHasAllItemsFromBank(userBank.bank, bank.bank)) {
		throw new Error("User bank doesn't have all items in the target bank");
	}
	return bank;
}
