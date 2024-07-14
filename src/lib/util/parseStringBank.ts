import { evalMathExpression } from '@oldschoolgg/toolkit';
import { notEmpty } from 'e';
import { Bank, Items } from 'oldschooljs';
import type { Item } from 'oldschooljs/dist/meta/types';
import { itemNameMap } from 'oldschooljs/dist/structures/Items';

import { ONE_TRILLION } from '../constants';
import { filterableTypes } from '../data/filterables';
import { cleanString, getItem, stringMatches } from '../util';
import itemIsTradeable from './itemIsTradeable';

const { floor, max, min } = Math;

export function parseQuantityAndItem(str = '', inputBank?: Bank): [Item[], number] | [] {
	str = str.trim();
	if (!str) return [];
	// Make it so itemIDs aren't interpreted as quantities
	if (str.match(/^[0-9]+$/)) str = `0 ${str}`;
	const split = str.split(' ');

	// If we're passed 2 numbers in a row, e.g. '1 1 coal', remove that number and recurse back.
	if (!Number.isNaN(Number(split[1])) && split.length > 2) {
		split.splice(1, 1);
		return parseQuantityAndItem(split.join(' '));
	}

	let [potentialQty, ...potentialName] = split.length === 1 ? ['', [split[0]]] : split;

	const lazyItemGet = Items.get(potentialName.join(' ')) ?? Items.get(Number(potentialName.join(' ')));
	if (str.includes('#') && lazyItemGet && inputBank) {
		potentialQty = potentialQty.replace('#', inputBank.amount(lazyItemGet.id).toString());
	}

	let parsedQty: number | null = evalMathExpression(potentialQty.replace('x', ''));
	if (parsedQty !== null && Number.isNaN(parsedQty)) parsedQty = null;

	const parsedName = parsedQty === null ? str : potentialName.join(' ');

	let osItems: Item[] = [];

	const nameAsInt = Number(parsedName);
	if (!Number.isNaN(nameAsInt)) {
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

	const quantity = floor(min(ONE_TRILLION, max(0, parsedQty ?? 0)));

	return [osItems, quantity];
}

export function parseStringBank(
	str = '',
	inputBank?: Bank,
	noDuplicateItems?: true,
	itemAliases?: true
): [Item, number | undefined][] {
	const split = str
		.trim()
		.replace(/\s\s+/g, ' ')
		.split(',')
		.filter(i => notEmpty(i) && i !== '');
	if (split.length === 0) return [];
	const items: [Item, number | undefined][] = [];
	const currentIDs = new Set();
	for (let i = 0; i < split.length; i++) {
		const [resItems, quantity] = parseQuantityAndItem(split[i], inputBank);
		if (resItems !== undefined) {
			for (const item of noDuplicateItems ? resItems.slice(0, 1) : resItems) {
				if (currentIDs.has(item.id)) continue;
				let resolvedItem: Item | null = item;
				if (itemAliases) {
					resolvedItem = getItem(item.name);
				}
				if (resolvedItem) {
					items.push([resolvedItem, quantity]);
					currentIDs.add(resolvedItem.id);
				}
			}
		}
	}

	return items;
}

function parseBankFromFlags({
	bank,
	flags,
	excludeItems,
	maxSize,
	user
}: {
	bank: Bank;
	flags: Record<string, string | undefined>;
	excludeItems: readonly number[];
	maxSize?: number;
	user?: MUser;
}): Bank {
	const newBank = new Bank();
	const maxQuantity = Number(flags.qty) || Number.POSITIVE_INFINITY;

	// Add filterables
	const flagsKeys = Object.keys(flags);
	const filter = filterableTypes.find(type =>
		type.aliases.some(alias => flagsKeys.some(i => stringMatches(i, alias)))
	);

	const itemFilter = filter ? filter.items(user) : undefined;
	for (const [item, quantity] of bank.items()) {
		if (maxSize && newBank.length >= maxSize) break;
		if (flagsKeys.includes('tradeables') && !itemIsTradeable(item.id)) continue;
		if (flagsKeys.includes('untradeables') && itemIsTradeable(item.id)) continue;
		if (flagsKeys.includes('equippables') && !item.equipment?.slot) continue;
		if (
			flagsKeys.includes('search') &&
			flags.search &&
			!item.name.toLowerCase().includes(flags.search.toLowerCase())
		) {
			continue;
		}

		const qty = Math.min(maxQuantity, quantity === 0 ? Math.max(1, bank.amount(item.id)) : quantity);
		if (itemFilter && !itemFilter.includes(item.id)) continue;
		if (excludeItems.includes(item.id)) continue;

		newBank.add(item.id, qty);
	}

	return newBank;
}

interface ParseBankOptions {
	inputBank?: Bank;
	flags?: Record<string, string | undefined>;
	inputStr?: string;
	excludeItems?: number[];
	filters?: (string | undefined)[];
	search?: string;
	maxSize?: number;
	user?: MUser;
	noDuplicateItems?: true;
	itemAliases?: true;
}

export function parseBank({
	inputBank,
	inputStr,
	flags = {},
	excludeItems = [],
	filters,
	search,
	maxSize,
	user,
	noDuplicateItems = undefined,
	itemAliases = undefined
}: ParseBankOptions): Bank {
	if (inputStr) {
		const _bank = new Bank();
		const strItems = parseStringBank(inputStr, inputBank, noDuplicateItems, itemAliases);
		for (const [item, quantity] of strItems) {
			if (maxSize && _bank.length >= maxSize) break;
			_bank.add(
				item.id,
				!quantity
					? inputBank?.amount(item.id)
					: inputBank === undefined
						? quantity
						: Math.max(0, Math.min(quantity, inputBank.amount(item.id) ?? 1))
			);
		}
		return _bank;
	}

	if (filters) {
		for (const filter of filters.filter(notEmpty)) {
			flags[filter] = filter;
		}
	}

	if (search) {
		flags.search = search;
	}

	return parseBankFromFlags({ bank: inputBank ?? new Bank(), flags, excludeItems, maxSize, user });
}
