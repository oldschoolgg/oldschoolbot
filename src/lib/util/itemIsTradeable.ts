import { isSuperUntradeable } from '../bso/bsoUtil';
import { COINS_ID } from '../constants';
import getOSItem from './getOSItem';

export default function itemIsTradeable(itemID: number | string, allowCoins = false) {
	const osItem = getOSItem(itemID);
	if (allowCoins && osItem.id === COINS_ID) return true;

	return !isSuperUntradeable(osItem);
}
