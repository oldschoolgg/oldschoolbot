import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, userID } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinigameScore('ChampionsChallenge', 1);

		const loot = new Bank({ "Champion's cape": 1 });

		user.addItemsToBank(loot, true);
		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user}, ${user.minionName} completed the Champion's Challenge! You have received the **Champion's cape**.`,
			undefined,
			undefined,
			data,
			loot.bank
		);
	}
}
