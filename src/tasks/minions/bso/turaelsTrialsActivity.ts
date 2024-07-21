import { Bank } from 'oldschooljs';

import type { TuraelsTrialsMethod } from '../../../lib/bso/turaelsTrials';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { XPBank } from '../../../lib/structures/Banks';
import type { TuraelsTrialsOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export function calculateTuraelsTrialsResult({ quantity, method }: { quantity: number; method: TuraelsTrialsMethod }) {
	const loot = new Bank();
	const xpBank = new XPBank().add('slayer', 36_009 * quantity);

	if (method === 'melee') {
		const meleeXP = Math.floor((89_000 * quantity) / 3);
		xpBank.add('attack', meleeXP);
		xpBank.add('strength', meleeXP);
		xpBank.add('defence', meleeXP);
	} else if (method === 'range') {
		xpBank.add('ranged', 89_000 * quantity);
	} else {
		xpBank.add('magic', 89_000 * quantity);
	}

	xpBank.add('hitpoints', Math.floor((89_000 * quantity) / 3));

	return {
		xpBank,
		loot
	};
}

export const turaelsTrialsTask: MinionTask = {
	type: 'TuraelsTrials',
	async run(data: TuraelsTrialsOptions) {
		const { q: quantity, channelID, userID, duration, m: method } = data;
		const user = await mUserFetch(userID);

		const result = calculateTuraelsTrialsResult({ quantity, method });

		const { newScore } = await incrementMinigameScore(userID, 'turaels_trials', quantity);

		await user.addItemsToBank({ items: result.loot, collectionLog: true });

		const xpResults: string[] = await user.addXPBank({
			bank: result.xpBank,
			duration,
			minimal: true,
			source: 'TuraelsTrials'
		});

		return handleTripFinish(
			user,
			channelID,
			`${user}, your minion finished slaying ${quantity}x superiors in Turaels Trials.\n**Your Turaels Trials KC is now ${newScore}**.\n\n${xpResults.join(
				', '
			)}`,
			undefined,
			data,
			result.loot
		);
	}
};