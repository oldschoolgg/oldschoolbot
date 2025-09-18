import { Bank, EItem, resolveItems } from 'oldschooljs';

import { leaguesCreatables } from '../data/creatables/leagueCreatables.js';
import { leagueBuyables } from '../data/leaguesBuyables.js';
import getOSItem from './getOSItem.js';

const specialUntradeables = resolveItems([
	'Coins',
	...leaguesCreatables
		.filter(i => !i.noCl)
		.map(i => new Bank(i.outputItems))
		.flatMap(i => i.items().map(i => i[0].id)),
	...leagueBuyables.map(i => i.item.id)
]);

/**
 * These items aren't tradeable ingame, but we want to specially let them be traded.
 */
const specialTradeables = resolveItems([
	'Slice of birthday cake',
	'War ship',
	'Birthday present',
	'Black santa hat',
	'Inverted santa hat'
]);

export default function itemIsTradeable(itemID: number | string, allowCoins = false) {
	const osItem = getOSItem(itemID);
	if (allowCoins && osItem.id === EItem.COINS) return true;

	if (specialTradeables.includes(osItem.id)) return true;
	if (specialUntradeables.includes(osItem.id) || !('tradeable' in osItem) || !osItem.tradeable) {
		return false;
	}

	return true;
}
