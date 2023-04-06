import { Bank } from 'oldschooljs';

import { KourendFavourActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { KourendFavours, UserKourendFavour } from './../../lib/minions/data/kourendFavour';

export const kourendTask: MinionTask = {
	type: 'KourendFavour',
	async run(data: KourendFavourActivityTaskOptions) {
		let { quantity, userID, channelID } = data;
		const favour = KourendFavours.find(i => i.name === data.favour)!;
		const user = await mUserFetch(userID);
		const favourPoints = favour.pointsGain * quantity;
		let shayzienDone = false;
		let totalPoints: number | undefined = undefined;
		const currentUserFavour = user.kourendFavour;
		for (const [key, value] of Object.entries(currentUserFavour) as [keyof UserKourendFavour, number][]) {
			if (key.toLowerCase() === favour.name.toLowerCase()) {
				totalPoints = Math.min(Number(value) + favourPoints, 100);
				currentUserFavour[key] = totalPoints;
				await user.update({
					kourend_favour: currentUserFavour as any
				});
				if (key === 'Shayzien' && totalPoints === 100) shayzienDone = true;
				break;
			}
		}
		const confirmedFavour = KourendFavours.find(i => i.name === favour.name)!;
		const loot = confirmedFavour.itemsReceived?.clone().multiply(quantity);
		if (shayzienDone && loot) {
			loot.add(
				new Bank({
					'Shayzien boots (1)': 5,
					'Shayzien gloves (1)': 5,
					'Shayzien greaves (1)': 5,
					'Shayzien helm (1)': 5,
					'Shayzien platebody (1)': 5,
					'Shayzien boots (2)': 5,
					'Shayzien gloves (2)': 5,
					'Shayzien greaves (2)': 5,
					'Shayzien helm (2)': 5,
					'Shayzien platebody (2)': 5,
					'Shayzien boots (3)': 5,
					'Shayzien gloves (3)': 5,
					'Shayzien greaves (3)': 5,
					'Shayzien helm (3)': 5,
					'Shayzien platebody (3)': 5,
					'Shayzien boots (4)': 5,
					'Shayzien gloves (4)': 5,
					'Shayzien greaves (4)': 5,
					'Shayzien helm (4)': 5,
					'Shayzien platebody (4)': 5,
					'Shayzien boots (5)': 5,
					'Shayzien gloves (5)': 5,
					'Shayzien greaves (5)': 5,
					'Shayzien helm (5)': 5,
					'Shayzien body (5)': 5
				})
			);
		}
		if (loot) {
			await transactItems({
				userID: user.id,
				collectionLog: true,
				itemsToAdd: loot
			});
		}

		let str = `${user}, ${user.minionName} finished gaining ${favour.name} Favour, adding ${favourPoints}%.${
			totalPoints ? ` You now have a total of ${totalPoints}%.` : ''
		}${loot ? ` You also received ${loot}.` : ''}`;

		handleTripFinish(user, channelID, str, undefined, data, loot ?? null);
	}
};
