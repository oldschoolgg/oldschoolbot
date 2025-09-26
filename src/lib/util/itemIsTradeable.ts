import { isSuperUntradeable } from '@/lib/bso/bsoUtil.js';

import { EItem, Items } from 'oldschooljs';

export default function itemIsTradeable(itemID: number | string, allowCoins = false) {
	const osItem = Items.getOrThrow(itemID);
	if (allowCoins && osItem.id === EItem.COINS) return true;

	return !isSuperUntradeable(osItem);
}
