import { EItem } from 'oldschooljs';

import { isSuperUntradeable } from '@/lib/bso/bsoUtil.js';
import getOSItem from './getOSItem.js';

export default function itemIsTradeable(itemID: number | string, allowCoins = false) {
	const osItem = getOSItem(itemID);
	if (allowCoins && osItem.id === EItem.COINS) return true;

	return !isSuperUntradeable(osItem);
}
