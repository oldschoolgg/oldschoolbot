import { Bank, Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { itemNameMap } from 'oldschooljs/dist/structures/Items';

import { filterableTypes } from '../data/filterables';
import { cleanString, stringMatches } from '../util';

export function customKMB(number: string) {
	if (!number.toLowerCase().match('^[.bmk0-9]+$')) return NaN;
	let previous = 0;
	let strNum = '';
	for (const c of number.split('')) {
		switch (c) {
			case 'b':
				previous += Number(strNum) * 1_000_000_000;
				strNum = '';
				break;
			case 'm':
				previous += Number(strNum) * 1_000_000;
				strNum = '';
				break;
			case 'k':
				previous += Number(strNum) * 1000;
				strNum = '';
				break;
			default:
				strNum += c;
				break;
		}
	}
	if (strNum) previous += Number(strNum);
	return previous;
}

type TParsedItem = [Item, number];

export function parseStringBank(str: string, allOfTheSameItem: boolean = true): TParsedItem[] {
	const returnItems: TParsedItem[] = [];
	if (str) {
		for (const s of str.split(',')) {
			let item = s.trim();
			const splitItem = item.split(' ');
			// Check if there is two numbers back to back on a search by name
			if (splitItem.length > 2) {
				let n1 = customKMB(splitItem[0]);
				let n2 = customKMB(splitItem[1]);
				// If both are numbers, ignore the first one
				if (!isNaN(n1) && !isNaN(n2)) splitItem.shift();
			}
			let qty = customKMB(splitItem[0]);
			// If the qty was valid, remove the first element of the array
			if (!isNaN(qty) && splitItem.length > 1) splitItem.shift();
			else qty = 0;
			item = splitItem.join(' ');
			const forcedID = Number(item) === parseInt(item);
			// If the item was a string, check all items with this name
			if (!forcedID) {
				let numFound = 0;
				const foundItems = Items.filter(i => {
					// If the allOfTheSameItem is false, return only the first item found
					const foundMap = itemNameMap.get(cleanString(item)) === i.id || stringMatches(i.name, item);
					if (!foundMap || (!allOfTheSameItem && numFound > 0)) return false;
					numFound++;
					return true;
				}).map(i => {
					return [i, qty];
				}) as TParsedItem[];
				returnItems.push(...foundItems);
			} else {
				const _i = Items.get(forcedID ? Number(item) : item);
				if (_i) returnItems.push([_i, qty]);
			}
		}
	}
	console.log(
		str,
		returnItems.map(i => [i[0].id, i[0].name, i[1]])
	);
	return returnItems;
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

		const qty = _qty === 0 ? Math.max(1, inputBank.amount(item.id)) : _qty;
		if (filter && !filter.items.includes(item.id)) continue;

		if (inputBank.amount(item.id) < qty) continue;
		outputBank.addItem(item.id, qty);
	}

	return outputBank;
}
