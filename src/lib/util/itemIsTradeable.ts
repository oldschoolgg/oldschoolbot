import { EItem } from 'oldschooljs';

import { isSuperUntradeable } from '../bso/bsoUtil';
import getOSItem from './getOSItem';

export default function itemIsTradeable(itemID: number | string, allowCoins = false) {
	const osItem = getOSItem(itemID);
	if (allowCoins && osItem.id === EItem.COINS) return true;

	return !isSuperUntradeable(osItem);
}
