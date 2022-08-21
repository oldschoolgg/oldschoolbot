import { increaseNumByPercent, reduceNumByPercent } from 'e';
import { Task } from 'klasa';

import { incrementMinigameScore } from '../../../lib/settings/settings';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { roll } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { mahojiUserSettingsUpdate } from '../../../mahoji/mahojiSettings';

function calcPoints() {
	let base = 42.5;
	if (roll(5)) {
		base = 30;
	}
	if (roll(15)) {
		base = 10;
	}
	if (roll(2)) {
		base = increaseNumByPercent(base, 20);
	} else {
		base = reduceNumByPercent(base, 20);
	}
	return Math.ceil(base);
}

export default class extends Task {
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, quantity, userID } = data;
		const user = await mUserFetch(userID);

		let points = 0;
		for (let i = 0; i < quantity; i++) {
			points += calcPoints();
		}

		const { newUser } = await mahojiUserSettingsUpdate(userID, {
			zeal_tokens: {
				increment: points
			}
		});

		await incrementMinigameScore(user.id, 'soul_wars', quantity);

		const str = `${user}, ${user.minionName} finished doing ${quantity}x games of Soul Wars, you received ${points} Zeal Tokens, you now have ${newUser.zeal_tokens}.\n\n`;

		handleTripFinish(
			user,
			channelID,
			str,
			['minigames', { soul_wars: { start: {} } }, true],
			undefined!,
			data,
			null
		);
	}
}
