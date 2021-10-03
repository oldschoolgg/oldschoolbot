import { Task } from 'klasa';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { KourendFavourActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { KourendFavours, UserKourendFavour } from './../../lib/minions/data/kourendFavour';

export default class extends Task {
	async run(data: KourendFavourActivityTaskOptions) {
		let { favour, quantity, userID, channelID } = data;
		const user = await this.client.fetchUser(userID);
		const favourPoints = favour.pointsGain * quantity;
		let totalPoints: number | undefined = undefined;
		const currentUserFavour = user.settings.get(UserSettings.KourendFavour);
		for (const [key, value] of Object.entries(currentUserFavour) as [keyof UserKourendFavour, number][]) {
			if (key.toLowerCase() === favour.name.toLowerCase()) {
				totalPoints = Math.min(Number(value) + favourPoints, 100);
				currentUserFavour[key] = totalPoints;
				user.settings.update(UserSettings.KourendFavour, currentUserFavour);
				break;
			}
		}
		const confirmedFavour = KourendFavours.find(i => i.name === favour.name)!;
		const loot = confirmedFavour.itemsRecieved?.clone().multiply(quantity);
		if (loot) {
			await user.addItemsToBank(loot.bank, true);
		}

		let str = `${user}, ${user.minionName} finished gaining ${favour.name} Favour, adding ${favourPoints}%.${
			totalPoints ? ` You now have a total of ${totalPoints}%.` : ''
		}${loot ? ` You also recieved ${loot}.` : ''}`;

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of kourend Favour ${favour.name}`);
				return this.client.commands.get('favour')!.run(res, [favour.name]);
			},
			undefined,
			data,
			loot?.bank ?? null
		);
	}
}
