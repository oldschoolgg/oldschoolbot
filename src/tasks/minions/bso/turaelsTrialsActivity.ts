import { Bank } from 'oldschooljs';

import type { TuraelsTrialsMethod } from '../../../lib/bso/turaelsTrials';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { XPBank } from '../../../lib/structures/Banks';
import type { TuraelsTrialsOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { trackClientBankStats, userStatsBankUpdate } from '../../../mahoji/mahojiSettings';

export function calculateTuraelsTrialsResult({
	quantity,
	method,
	duration
}: { duration: number; quantity: number; method: TuraelsTrialsMethod }) {
	const loot = new Bank();
	const options = { source: 'TuraelsTrials', duration, minimal: true } as const;
	const xpBank = new XPBank().add('slayer', 36_009 * quantity, options);

	if (method === 'melee') {
		const meleeXP = Math.floor((89_000 * quantity) / 3);
		xpBank.add('attack', meleeXP, options);
		xpBank.add('strength', meleeXP, options);
		xpBank.add('defence', meleeXP, options);
	} else if (method === 'range') {
		xpBank.add('ranged', 89_000 * quantity, options);
	} else {
		xpBank.add('magic', 89_000 * quantity, options);
	}

	xpBank.add('hitpoints', Math.floor((89_000 * quantity) / 3), options);

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

		const result = calculateTuraelsTrialsResult({ quantity, method, duration });

		const { newScore } = await incrementMinigameScore(userID, 'turaels_trials', quantity);

		await user.addItemsToBank({ items: result.loot, collectionLog: true });
		await trackClientBankStats('turaels_trials_loot_bank', result.loot);
		await userStatsBankUpdate(user.id, 'turaels_trials_loot_bank', result.loot);

		const xpResults = await user.addXPBank(result.xpBank);

		return handleTripFinish(
			user,
			channelID,
			`${user}, your minion finished slaying ${quantity}x superiors in Turaels Trials.\n**Your Turaels Trials KC is now ${newScore}**.\n\n${xpResults}`,
			undefined,
			data,
			result.loot
		);
	}
};
