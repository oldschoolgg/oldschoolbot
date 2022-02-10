import { notEmpty } from 'e';
import { Bank, Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { itemNameMap } from 'oldschooljs/dist/structures/Items';

import { MAX_INT_JAVA } from '../constants';
import { filterableTypes } from '../data/filterables';
import { evalMathExpression } from '../expressionParser';
import { cleanString, stringMatches } from '../util';

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

	let lazyItemGet = Items.get(potentialName.join(' ')) ?? Items.get(Number(potentialName.join(' ')));
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

export function parseStringBank(str = '', inputBank?: Bank, noDuplicateItems?: true): [Item, number | undefined][] {
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
			for (const item of noDuplicateItems ? resItems.slice(0, 1) : resItems) {
				if (currentIDs.has(item.id)) continue;
				currentIDs.add(item.id);
				items.push([item, quantity]);
			}
		}
	}
	return items;
}

export function parseBankFromFlags({
	bank,
	flags,
	excludeItems,
	maxSize
}: {
	bank: Bank;
	flags: Record<string, string>;
	excludeItems: readonly number[];
	maxSize?: number;
}): Bank {
	const newBank = new Bank();
	const maxQuantity = Number(flags.qty) || Infinity;

	// Add filterables
	const flagsKeys = Object.keys(flags);
	const filter = filterableTypes.find(type =>
		type.aliases.some(alias => flagsKeys.some(i => stringMatches(i, alias)))
	);

	for (const [item, quantity] of bank.items()) {
		if (maxSize && newBank.length >= maxSize) break;
		if (flagsKeys.includes('tradeables') && !item.tradeable) continue;
		if (flagsKeys.includes('untradeables') && item.tradeable) continue;
		if (flagsKeys.includes('equippables') && !item.equipment?.slot) continue;
		if (flagsKeys.includes('search') && !item.name.toLowerCase().includes(flags.search.toLowerCase())) {
			continue;
		}

		const qty = Math.min(maxQuantity, quantity === 0 ? Math.max(1, bank.amount(item.id)) : quantity);
		if (filter && !filter.items.includes(item.id)) continue;
		if ((filter || flagsKeys.length) && excludeItems.includes(item.id)) continue;

		newBank.add(item.id, qty);
	}

	return newBank;
}

interface ParseBankOptions {
	inputBank: Bank;
	flags?: Record<string, string>;
	inputStr?: string;
	excludeItems?: number[];
	filters?: string[];
	search?: string;
	maxSize?: number;
}

export function parseBank({
	inputBank,
	inputStr,
	flags = {},
	excludeItems = [],
	filters,
	search,
	maxSize
}: ParseBankOptions): Bank {
	if (inputStr) {
		let _bank = new Bank();
		const strItems = parseStringBank(inputStr, inputBank);
		for (const [item, quantity] of strItems) {
			if (maxSize && _bank.length >= maxSize) break;
			_bank.add(
				item.id,
				!quantity ? inputBank.amount(item.id) : Math.max(0, Math.min(quantity, inputBank.amount(item.id)))
			);
		}
		return _bank;
	}

	if (filters) {
		for (const filter of filters) {
			flags[filter] = filter;
		}
	}

	if (search) {
		flags.search = search;
	}

	return parseBankFromFlags({ bank: inputBank, flags, excludeItems, maxSize });
}

function truncateBankToSize(bank: Bank, size: number) {
	let newBank = new Bank();

	for (const [item, qty] of bank.items()) {
		if (newBank.length === size) break;
		newBank.add(item.id, qty);
	}

	return newBank;
}

interface ParseInputCostBankOptions {
	usersBank: Bank;
	flags?: Record<string, string>;
	inputStr?: string;
	excludeItems: readonly number[];
}
export function parseInputCostBank({ usersBank, inputStr, flags = {}, excludeItems }: ParseInputCostBankOptions): Bank {
	if (!inputStr && Object.keys(flags).length > 0) {
		return truncateBankToSize(parseBankFromFlags({ bank: usersBank, flags, excludeItems }), 60);
	}

	const baseBank = parseBankFromFlags({ bank: usersBank, flags, excludeItems });
	const stringInputBank = Boolean(inputStr) ? parseStringBank(inputStr, baseBank, true) : [];

	const bank = new Bank();
	for (const [item, qty] of stringInputBank) {
		const amountOwned = baseBank.amount(item.id);
		const maxQuantity = Number(flags.qty) || Infinity;
		bank.add(item.id, Math.min(maxQuantity, amountOwned, qty || amountOwned));
	}

	return truncateBankToSize(bank, 60);
}

export function parseInputBankWithPrice({
	usersBank,
	str,
	flags,
	excludeItems
}: {
	usersBank: Bank;
	str: string;
	flags: Record<string, string>;
	excludeItems: readonly number[];
}) {
	const split = str.split(' ');
	const firstAsNumber = evalMathExpression(split[0]);

	if (!firstAsNumber) {
		return {
			price: 0,
			bank: parseInputCostBank({ usersBank, inputStr: str, flags, excludeItems })
		};
	}

	const bankParsedFromFlags = parseBankFromFlags({ bank: usersBank, flags, excludeItems });
	const flagsHaveAnEffectOnBank = bankParsedFromFlags.length !== usersBank.length;

	if (split.length === 1) {
		const potentialItem = Items.get(firstAsNumber);
		if (!potentialItem) {
			return {
				price: firstAsNumber,
				bank: flagsHaveAnEffectOnBank ? bankParsedFromFlags : new Bank()
			};
		}
		return {
			price: 0,
			bank: parseInputCostBank({ usersBank, flags, inputStr: potentialItem.name, excludeItems })
		};
	}

	return {
		price: firstAsNumber,
		bank: parseInputCostBank({ usersBank, inputStr: str.split(' ').slice(1).join(' '), flags, excludeItems })
	};
}
