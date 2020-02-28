import { Items } from 'oldschooljs';

import { transformArrayOfResolvableItems } from './transformArrayOfResolvableItems';

const specialUntradeables = transformArrayOfResolvableItems(['Coins']);

export default function itemIsTradeable(itemID: number | string) {
	const osItem = Items.get(itemID);
	if (!osItem) throw `That item doesnt exist.`;

	if (specialUntradeables.includes(osItem.id) || !('tradeable' in osItem) || !osItem.tradeable) {
		return false;
	}

	return true;
}
