import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { userHasFlappy } from '../../lib/invention/inventions';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { KourendFavourActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { KourendFavours, UserKourendFavour } from './../../lib/minions/data/kourendFavour';

export default class extends Task {
	async run(data: KourendFavourActivityTaskOptions) {
		let { favour, quantity, userID, channelID, duration } = data;
		const user = await this.client.fetchUser(userID);
		let favourPoints = favour.pointsGain * quantity;
		let shayzienDone = false;
		let totalPoints: number | undefined = undefined;
		const currentUserFavour = user.settings.get(UserSettings.KourendFavour);

		const flappyRes = await userHasFlappy({ user, duration });

		if (flappyRes.shouldGiveBoost) {
			favourPoints *= 2;
		}

		for (const [key, value] of Object.entries(currentUserFavour) as [keyof UserKourendFavour, number][]) {
			if (key.toLowerCase() === favour.name.toLowerCase()) {
				totalPoints = Math.min(Number(value) + favourPoints, 100);
				currentUserFavour[key] = totalPoints;
				await user.settings.update(UserSettings.KourendFavour, currentUserFavour);
				if (key === 'Shayzien' && totalPoints === 100) shayzienDone = true;
				break;
			}
		}
		const confirmedFavour = KourendFavours.find(i => i.name === favour.name)!;
		const loot = confirmedFavour.itemsRecieved?.clone().multiply(quantity);
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
		}${loot ? ` You also recieved ${loot}.` : ''}`;
		if (flappyRes.userMsg) {
			str += `\n\n${flappyRes.userMsg}`;
		}

		handleTripFinish(
			user,
			channelID,
			str,
			['activities', { favour: { name: confirmedFavour.name } }, true],
			undefined,
			data,
			loot ?? null
		);
	}
}
