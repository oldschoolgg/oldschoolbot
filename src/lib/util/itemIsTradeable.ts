import getOSItem from './getOSItem';
import resolveItems from './resolveItems';

const specialUntradeables = resolveItems(['Coins']);

/**
 * These items aren't tradeable ingame, but we want to specially let them be traded.
 */
export const specialTradeables = resolveItems([
	'Slice of birthday cake',
	'War ship',
	'Birthday present',
	'Mystery box'
]);

export default function itemIsTradeable(itemID: number | string) {
	const osItem = getOSItem(itemID);

	if (specialTradeables.includes(osItem.id)) return true;
	if (specialUntradeables.includes(osItem.id) || !('tradeable' in osItem) || !osItem.tradeable) {
		return false;
	}

	return true;
}
