import { Bank } from 'oldschooljs';

import { TuraelsTrialsMethod } from '../../../lib/bso/turaelsTrials';
import { XPBank } from '../../../lib/structures/Banks';
import { TuraelsTrialsOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { trackClientBankStats, userStatsBankUpdate } from '../../../mahoji/mahojiSettings';

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

	xpBank.add('hitpoints', 89_000 * quantity);

	return {
		xpBank,
		loot
	};
}

export const turaelsTrialsTask: MinionTask = {
	type: 'TuraelsTrials',
	async run(data: TuraelsTrialsOptions) {
		let { q: quantity, channelID, userID, duration, m: method } = data;
		const user = await mUserFetch(userID);

		const result = calculateTuraelsTrialsResult({ quantity, method });

		await user.addItemsToBank({ items: result.loot, collectionLog: true });
		await trackClientBankStats('turaels_trials_loot_bank', result.loot);
		await userStatsBankUpdate(user.id, 'turaels_trials_loot_bank', result.loot);

		const xpResults: string[] = await user.addXPBank({
			bank: result.xpBank,
			duration,
			minimal: true,
			source: 'TuraelsTrials'
		});

		return handleTripFinish(
			user,
			channelID,
			`${user}, your minion finished slaying ${quantity}x superiors in Turaels Trials. ${xpResults.join(', ')}`,
			undefined,
			data,
			result.loot
		);
	}
};
