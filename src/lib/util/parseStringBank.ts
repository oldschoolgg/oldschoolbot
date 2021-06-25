import { Bank, Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { fromKMB } from 'oldschooljs/dist/util';

import { MAX_INT_JAVA } from '../constants';
import { filterableTypes } from '../data/filterables';
import { stringMatches } from '../util';

function parseQuantityAndItem(str = ''): [Item[], number] | [] {
	str = str.trim();
	if (!str) return [];
	const split = str.split(' ');

	// If we're passed 2 numbers in a row, e.g. '1 1 coal', remove that number and recurse back.
	if (!isNaN(Number(split[1]))) {
		split.splice(1, 1);
		return parseQuantityAndItem(split.join(' '));
	}

	let [potentialQty, ...potentialName] = split;
	// Fix for 3rd age items
	if (potentialQty === '3rd') potentialQty = '';
	let parsedQty: number | undefined = fromKMB(potentialQty);
	// Can return number, NaN or undefined. We want it to be only number or undefined.
	if (isNaN(parsedQty)) parsedQty = undefined;
	const parsedName = parsedQty === undefined ? str : potentialName.join('');
	let osItems: Item[] = Array.from(Items.filter(i => stringMatches(i.name, parsedName)).values());

	let quantity = parsedQty ?? 0;
	if (quantity < 0) quantity = 0;

	quantity = Math.floor(Math.min(MAX_INT_JAVA, quantity));

	return [osItems, quantity];
}

export function parseStringBank(str = ''): [Item, number][] {
	str = str.trim().replace(/\s\s+/g, ' ');
	if (!str) return [];
	const split = str.split(',');
	if (split.length === 0) return [];
	let items: [Item, number][] = [];
	const currentIDs = new Set();
	for (let i = 0; i < split.length; i++) {
		let [resItems, quantity] = parseQuantityAndItem(split[i]);
		if (resItems !== undefined) {
			for (const item of resItems) {
				if (currentIDs.has(item.id)) continue;
				currentIDs.add(item.id);
				items.push([item, quantity ?? 0]);
			}
		}
	}
	return items;
}

interface ParseBankOptions {
	inputBank: Bank;
	flags?: Record<string, string>;
	inputStr?: string;
}

export function parseBank({ inputBank, inputStr, flags = {} }: ParseBankOptions): Bank {
	const items = inputBank.items();

	if (inputStr) {
		let _bank = new Bank();
		const strItems = parseStringBank(inputStr);
		for (const [item] of strItems) _bank.add(item.id, inputBank.amount(item.id));
		return _bank;
	}

	// Add filterables
	const flagsKeys = Object.keys(flags);
	const filter = filterableTypes.find(type => type.aliases.some(alias => flagsKeys.includes(alias)));

	const outputBank = new Bank();

	for (const [item, _qty] of items) {
		if (flagsKeys.includes('tradeables') && !item.tradeable) continue;
		if (flagsKeys.includes('untradeables') && item.tradeable) continue;
		if (flagsKeys.includes('equippables') && !item.equipment?.slot) continue;
		if (flagsKeys.includes('search') && !item.name.toLowerCase().includes(flags.search.toLowerCase())) {
			continue;
		}

		const qty = _qty === 0 ? Math.max(1, inputBank.amount(item.id)) : _qty;
		if (filter && !filter.items.includes(item.id)) continue;

		if (inputBank.amount(item.id) < qty) continue;
		outputBank.addItem(item.id, qty);
	}

	return outputBank;
}
