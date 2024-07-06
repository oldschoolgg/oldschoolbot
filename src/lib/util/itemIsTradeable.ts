import { COINS_ID } from '../constants';
import { isSuperUntradeable } from '../util';
import getOSItem from './getOSItem';
<<<<<<< HEAD
=======
import resolveItems from './resolveItems';

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
>>>>>>> master

export default function itemIsTradeable(itemID: number | string, allowCoins = false) {
	const osItem = getOSItem(itemID);
	if (allowCoins && osItem.id === COINS_ID) return true;

	return !isSuperUntradeable(osItem);
}
