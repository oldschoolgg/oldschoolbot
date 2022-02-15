import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { incrementMinigameScore } from '../../../lib/settings/settings';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, userID } = data;
		const user = await this.client.fetchUser(userID);
		await incrementMinigameScore(userID, 'champions_challenge', 1);

		const loot = new Bank({ "Champion's cape": 1 });

		await user.addItemsToBank({ items: loot, collectionLog: true });

		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user}, ${user.minionName} completed the Champion's Challenge! You have received the **Champion's cape**.`,
			undefined,
			undefined,
			data,
			loot
		);
	}
}
