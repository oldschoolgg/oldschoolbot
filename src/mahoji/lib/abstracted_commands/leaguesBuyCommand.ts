import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { leagueBuyables } from '../../../lib/data/leaguesBuyables';
import { roboChimpUserFetch } from '../../../lib/roboChimp';
import { stringMatches } from '../../../lib/util';

const pointsCostMultiplier = 150;

export async function leaguesBuyCommand(user: KlasaUser, itemName: string, quantity = 1) {
	const item = leagueBuyables.find(i => stringMatches(i.item.name, itemName));
	if (!item) return "That's not a valid item.";

	let baseCost = item.price * pointsCostMultiplier;
	const cost = quantity * baseCost;
	const roboChimpUser = await roboChimpUserFetch(BigInt(user.id));
	if (roboChimpUser.leagues_points_balance_osb < cost) {
		return `You don't have enough League Points to purchase this. You need ${cost}, but you have ${roboChimpUser.leagues_points_balance_osb}.`;
	}
	const newUser = await roboChimpClient.user.update({
		where: {
			id: BigInt(user.id)
		},
		data: {
			leagues_points_balance_osb: {
				decrement: cost
			}
		}
	});

	const loot = new Bank().add(item.item.id, quantity);
	await transactItems({
		userID: user.id,
		itemsToAdd: loot,
		collectionLog: true
	});

	return `You spent ${cost} Leagues Points and received ${loot}. You have ${newUser.leagues_points_balance_osb} points remaining.`;
}
