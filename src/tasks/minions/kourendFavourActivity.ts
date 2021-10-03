import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { UserSettings } from '../../lib/settings/types/UserSettings';
import { KourendFavourActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: KourendFavourActivityTaskOptions) {
		let { favour, quantity, userID, channelID } = data;
		const user = await this.client.fetchUser(userID);
		const favourPoints = favour.pointsGain * quantity;
		const currentUserFavour = user.settings.get(UserSettings.KourendFavour);
		for (const [key, value] of Object.entries(currentUserFavour)) {
			if (key.toLowerCase() === favour.name.toLowerCase()) {
				const totalPoints = Math.min(Number(value) + favourPoints, 100);
				// Use key to only add points to specific value how??
				currentUserFavour.Arceuus = totalPoints;
				user.settings.update(UserSettings.KourendFavour, currentUserFavour);
				break;
			}
		}
		let loot: Bank = new Bank();
		if (favour.itemsRecieved) {
			loot.add(favour.itemsRecieved.bank, quantity);
			await user.addItemsToBank(loot.bank, true);
		}

		let str = `${user}, ${user.minionName} finished doing ${favour.name} Favour tasks. Adding ${favourPoints}% to ${
			favour.name
		} Favour.${loot.toString().length > 0 ? ` You also recieved ${loot}.` : ''}`;

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
			loot.bank ?? null
		);
	}
}
