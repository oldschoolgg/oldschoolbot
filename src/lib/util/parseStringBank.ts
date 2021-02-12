import numbro from 'numbro';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { MAX_INT_JAVA } from '../constants';
import { filterableTypes } from '../data/filterables';
import { cleanMentions } from '../util';
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

interface ParseBankOptions {
	inputBank: Bank;
	flags?: Record<string, string>;
}

export function parseBank({ inputBank, flags = {} }: ParseBankOptions): Bank {
	const outputBank = new Bank();

	const items = inputBank.items();

	// Add filterables
	const flagsKeys = Object.keys(flags);
	const filter = filterableTypes.find(type =>
		type.aliases.some(alias => flagsKeys.includes(alias))
	);

	for (const [item, _qty] of items) {
		if (flagsKeys.includes('tradeables') && !item.tradeable) continue;
		if (flagsKeys.includes('untradeables') && item.tradeable) continue;
		if (flagsKeys.includes('equippables') && !item.equipment?.slot) continue;
		if (flagsKeys.includes('search') && !item.name.toLowerCase().includes(flags.search)) {
			continue;
		}

		const qty = _qty === 0 ? Math.max(1, inputBank.amount(item.id)) : _qty;
		if (filter && !filter.items.includes(item.id)) continue;

		if (inputBank.amount(item.id) < qty) continue;
		outputBank.addItem(item.id, qty);
	}

	return outputBank;
}
