import { Bank } from '../types';
import { itemNameFromID } from '../util';

export function formatItemBoosts(items: Bank) {
	const str = [];
	for (const [itemID, boostAmount] of Object.entries(items)) {
		str.push(`${boostAmount}% for ${itemNameFromID(parseInt(itemID))}`);
	}
	return str.join(', ');
}
