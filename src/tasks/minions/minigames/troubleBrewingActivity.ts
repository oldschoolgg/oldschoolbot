import { MinionTask } from '../../../lib/Task';
import { Bank } from 'oldschooljs';

import { incrementMinigameScore } from '../../../lib/settings/minigames';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { mUserFetch } from '../../../mahoji/mahojiSettings';

export const TODO.Task: MinionTask = {
type: '',
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, quantity, userID } = data;
		const user = await mUserFetch(userID);
		await incrementMinigameScore(user.id, 'trouble_brewing', quantity);
		let loot = new Bank().add('Pieces of eight', quantity * 100);

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		let str = `${user}, ${user.minionName} finished doing ${quantity}x games of Trouble Brewing, you received: ${loot}.`;

		handleTripFinish(
			user,
			channelID,
			str,
			['minigames', { trouble_brewing: { start: {} } }, true],
			undefined,
			data,
			null
		);
	}
}
