import numbro from 'numbro';
import { Item } from 'oldschooljs/dist/meta/types';

import { MAX_INT_JAVA } from '../constants';
import { cleanMentions } from '../util';
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
		throw `\`${cleanMentions(null, parsedName)}\` is not a valid item name`;
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
