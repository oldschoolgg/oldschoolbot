import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { incrementMinigameScore } from '../../../lib/settings/settings';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { mUserFetch } from '../../../mahoji/mahojiSettings';

export default class extends Task {
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, userID } = data;
		const user = await mUserFetch(userID);
		await incrementMinigameScore(userID, 'champions_challenge', 1);

		const loot = new Bank({ "Champion's cape": 1 });

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(
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
