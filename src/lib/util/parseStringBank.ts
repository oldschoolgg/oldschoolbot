import numbro from 'numbro';
import { Item } from 'oldschooljs/dist/meta/types';

import { MAX_INT_JAVA } from '../constants';
import getOSItem from './getOSItem';

interface ItemResult {
	qty: number;
	item: Item;
}

function parseQuantityAndItem(str: string): ItemResult {
	str = str.trim();
	const [potentialQty, ...potentialName] = str.split(' ');
	const parsedQty = numbro(potentialQty).value() as number | undefined;
	const parsedName = parsedQty === undefined ? str : potentialName.join('');
	const osItem = getOSItem(parsedName);
	let quantity = parsedQty ?? 0;
	if (quantity < 0) quantity = 0;

	quantity = Math.floor(Math.min(MAX_INT_JAVA, quantity));

	return { item: osItem, qty: parsedQty ?? 0 };
}

export function parseStringBank(str: string): ItemResult[] {
	str = str.trim().replace(/\s\s+/g, ' ');
	if (!str) return [];
	const items = str.split(',').map(parseQuantityAndItem);
	return items;
}
