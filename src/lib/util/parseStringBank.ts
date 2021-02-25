import { KlasaClient } from 'klasa';
import numbro from 'numbro';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { MAX_INT_JAVA } from '../constants';
import { filterableTypes } from '../data/filterables';
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
		return null;
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
	client: KlasaClient;
	inputBank: Bank;
	flags?: Record<string, string>;
	inputStr?: string;
}

enum FilterType {
	lessThan,
	equals,
	greaterThan
}

function satisfiesQuantitativeFilter(subject: number, filter: FilterType, target: number): boolean {
	switch (filter) {
		case FilterType.lessThan:
			return subject < target;
		case FilterType.equals:
			return subject === target;
		case FilterType.greaterThan:
			return subject > target;
	}
	return true;
}

function parseFilterAndTarget(input: string | null): [FilterType, number] | [null, null] {
	if (!input) return [null, null];

	if (parseInt(input)) {
		return [FilterType.equals, parseInt(input)];
	} else if (input.startsWith('>')) {
		const value = input.replace('>', '');
		if (parseInt(value)) {
			return [FilterType.greaterThan, parseInt(value)];
		}
	} else if (input.startsWith('<')) {
		const value = input.replace('<', '');
		if (parseInt(value)) {
			return [FilterType.lessThan, parseInt(value)];
		}
	}
	return [null, null];
}

export async function parseBank({
	client,
	inputBank,
	inputStr,
	flags = {}
}: ParseBankOptions): Promise<Bank> {
	const items = inputBank.items();

	if (inputStr) {
		let _bank = new Bank();
		const strItems = parseStringBank(inputStr);
		for (const [item] of strItems) _bank.add(item.id, inputBank.amount(item.id));
		return _bank;
	}

	// Add filterables
	const flagsKeys = Object.keys(flags);
	const filter = filterableTypes.find(type =>
		type.aliases.some(alias => flagsKeys.includes(alias))
	);
	const [valueFilter, valueTarget] = parseFilterAndTarget(flags.value);
	const [quantityFilter, quantityTarget] = parseFilterAndTarget(flags.quantity);

	const outputBank = new Bank();

	for (const [item, _qty] of items) {
		if (flagsKeys.includes('tradeables') && !item.tradeable) continue;
		if (flagsKeys.includes('untradeables') && item.tradeable) continue;
		if (flagsKeys.includes('equippables') && !item.equipment?.slot) continue;
		if (flagsKeys.includes('search') && !item.name.toLowerCase().includes(flags.search)) {
			continue;
		}
		if (
			valueFilter !== null &&
			valueTarget !== null &&
			!satisfiesQuantitativeFilter(
				await client.fetchItemPrice(item.id),
				valueFilter,
				valueTarget
			)
		) {
			continue;
		}
		if (
			quantityFilter !== null &&
			quantityTarget !== null &&
			!satisfiesQuantitativeFilter(_qty, quantityFilter, quantityTarget)
		) {
			continue;
		}

		const qty = _qty === 0 ? Math.max(1, inputBank.amount(item.id)) : _qty;
		if (filter && !filter.items.includes(item.id)) continue;

		if (inputBank.amount(item.id) < qty) continue;
		outputBank.addItem(item.id, qty);
	}

	return outputBank;
}
