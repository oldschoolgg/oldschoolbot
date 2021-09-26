import { notEmpty } from 'e';
import { Bank, Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { itemNameMap } from 'oldschooljs/dist/structures/Items';

import { MAX_INT_JAVA } from '../constants';
import { filterableTypes } from '../data/filterables';
import { evalMathExpression } from '../expressionParser';
import { cleanString, stringMatches } from '../util';
import getOSItem from './getOSItem';

const { floor, max, min } = Math;

export function parseQuantityAndItem(str = '', inputBank?: Bank): [Item[], number] | [] {
	str = str.trim();
	if (!str) return [];
	// Make it so itemIDs aren't interpreted as quantities
	if (str.match(/^[0-9]+$/)) str = `0 ${str}`;
	const split = str.split(' ');

	// If we're passed 2 numbers in a row, e.g. '1 1 coal', remove that number and recurse back.
	if (!isNaN(Number(split[1])) && split.length > 2) {
		split.splice(1, 1);
		return parseQuantityAndItem(split.join(' '));
	}

	let [potentialQty, ...potentialName] = split.length === 1 ? ['', [split[0]]] : split;

	let lazyItemGet = Items.get(potentialName.join(' '));
	if (str.includes('#') && lazyItemGet && inputBank) {
		potentialQty = potentialQty.replace('#', inputBank.amount(lazyItemGet.id).toString());
	}

	let parsedQty: number | null = evalMathExpression(potentialQty);
	if (parsedQty !== null && isNaN(parsedQty)) parsedQty = null;

	const parsedName = parsedQty === null ? str : potentialName.join(' ');

	let osItems: Item[] = [];

	const nameAsInt = Number(parsedName);
	if (!isNaN(nameAsInt)) {
		const item = Items.get(nameAsInt);
		if (item) osItems.push(item);
	} else {
		osItems = Array.from(
			Items.filter(
				i => itemNameMap.get(cleanString(parsedName)) === i.id || stringMatches(i.name, parsedName)
			).values()
		);
	}
	if (osItems.length === 0) return [];

	let quantity = floor(min(MAX_INT_JAVA, max(0, parsedQty ?? 0)));

	return [osItems, quantity];
}

export function parseStringBank(str = '', inputBank?: Bank): [Item, number | undefined][] {
	const split = str
		.trim()
		.replace(/\s\s+/g, ' ')
		.split(',')
		.filter(i => notEmpty(i) && i !== '');
	if (split.length === 0) return [];
	let items: [Item, number | undefined][] = [];
	const currentIDs = new Set();
	for (let i = 0; i < split.length; i++) {
		let [resItems, quantity] = parseQuantityAndItem(split[i], inputBank);
		if (resItems !== undefined) {
			for (const item of resItems) {
				if (currentIDs.has(item.id)) continue;
				currentIDs.add(item.id);
				items.push([item, quantity]);
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

	const maxQuantity = Number(flags.qty) || Infinity;

	if (inputStr) {
		let _bank = new Bank();
		const strItems = parseStringBank(inputStr, inputBank);
		for (const [item, quantity] of strItems) {
			_bank.add(
				item.id,
				!quantity ? inputBank.amount(item.id) : Math.max(0, Math.min(quantity, inputBank.amount(item.id)))
			);
		}
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

		const qty = Math.min(maxQuantity, _qty === 0 ? Math.max(1, inputBank.amount(item.id)) : _qty);
		if (filter && !filter.items.includes(item.id)) continue;

		if (inputBank.amount(item.id) < qty) continue;
		outputBank.addItem(item.id, qty);
	}

	return outputBank;
}

export function parseBankWithPrice({
	inputBank,
	str,
	flags = {}
}: {
	inputBank: Bank;
	str?: string;
	flags?: Record<string, string>;
}): {
	price: number;
	bank: Bank;
} {
	if (!str) {
		return {
			bank: parseBank({
				inputBank,
				inputStr: str,
				flags
			}),
			price: 0
		};
	}
	const split = str.split(' ');
	const [first] = split;

	let asPrice = evalMathExpression(first);
	let price: number = 0;

	try {
		const number = Number(first);
		if (!asPrice && !isNaN(number) && ![0, 1, 2].includes(number)) {
			getOSItem(number);
			price = 0;
		} else {
			price = asPrice ?? 0;
		}
	} catch {}

	const inputStr = asPrice === null ? str : str.split(' ').slice(1, str.length).join(' ');

	const bank = parseBank({
		inputBank,
		inputStr,
		flags
	});

	return {
		price,
		bank
	};
}
