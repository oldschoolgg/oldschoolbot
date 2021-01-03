import { Task } from 'klasa';

import { MinigameIDsEnum } from '../../../lib/minions/data/minigames';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { itemID } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, duration, userID } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);

		user.incrementMinigameScore(MinigameIDsEnum.ChampionsChallenge, 1);
		user.addItemsToBank({ [itemID(`Champion's cape`)]: 1 }, true);
		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user}, ${user.minionName} completed the Champion's Challenge! You have received the **Champion's cape**.`,
			undefined,
			data
		);
	}
}
