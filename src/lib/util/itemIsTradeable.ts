import { Bank } from 'oldschooljs';

import { COINS_ID } from '../constants';
import { leaguesCreatables } from '../data/creatables/leagueCreatables';
import { leagueBuyables } from '../data/leaguesBuyables';
import getOSItem from './getOSItem';
import resolveItems from './resolveItems';

const specialUntradeables = resolveItems([
	'Coins',
	...leaguesCreatables
		.filter(i => !i.noCl)
		.map(i => new Bank(i.outputItems))
		.map(i => i.items().map(i => i[0].id))
		.flat(),
	...leagueBuyables.map(i => i.item.id)
]);

/**
 * These items aren't tradeable ingame, but we want to specially let them be traded.
 */
export const specialTradeables = resolveItems([
	'Slice of birthday cake',
	'War ship',
	'Birthday present',
	'Black santa hat',
	'Inverted santa hat'
]);

export default function itemIsTradeable(itemID: number | string, allowCoins = false) {
	const osItem = getOSItem(itemID);
	if (allowCoins && osItem.id === COINS_ID) return true;

	if (specialTradeables.includes(osItem.id)) return true;
	if (specialUntradeables.includes(osItem.id) || !('tradeable' in osItem) || !osItem.tradeable) {
		return false;
	}

	return true;
}
