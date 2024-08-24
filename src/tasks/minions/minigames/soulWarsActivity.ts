import { increaseNumByPercent, reduceNumByPercent } from 'e';

import { incrementMinigameScore } from '../../../lib/settings/settings';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { roll } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

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

export const soulWarsTask: MinionTask = {
	type: 'SoulWars',
	async run(data: MinigameActivityTaskOptionsWithNoChanges) {
		const { channelID, quantity, userID } = data;
		const user = await mUserFetch(userID);

		let points = 0;
		for (let i = 0; i < quantity; i++) {
			points += calcPoints();
		}

		await user.update({
			zeal_tokens: {
				increment: points
			}
		});

		await incrementMinigameScore(user.id, 'soul_wars', quantity);

		const str = `${user}, ${user.minionName} finished doing ${quantity}x games of Soul Wars, you received ${points} Zeal Tokens, you now have ${user.user.zeal_tokens}.\n`;

		handleTripFinish(user, channelID, str, undefined!, data, null);
	}
};
