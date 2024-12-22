import { Time, roll } from 'e';
import { Bank } from 'oldschooljs';

import { christmasDroprates } from '../../../lib/christmasEvent.js';
import type { SnoozeSpellActiveCastOptions } from '../../../lib/types/minions.js';
import { formatDuration } from '../../../lib/util.js';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export const snoozeSpellActiveTask: MinionTask = {
	type: 'SnoozeSpellActive',
	async run(data: SnoozeSpellActiveCastOptions) {
		const { channelID, duration, userID } = data;
		const user = await mUserFetch(userID);
		const spellsCast = Math.floor(duration / Time.Minute);
		const loot = new Bank();
		for (const drop of christmasDroprates) {
			let dropRate = drop.chancePerMinute;
			if (drop.clDropRateIncrease && user.cl.amount(drop.items[0]) >= 1) {
				dropRate *= user.cl.amount(drop.items[0]) * drop.clDropRateIncrease;
			}
			dropRate = Math.ceil(dropRate / 2.5);
			for (let i = 0; i < spellsCast; i++) {
				if (roll(dropRate)) {
					for (const item of drop.items) loot.add(item);
				}
			}
		}

		if (loot.length > 0) {
			await user.addItemsToBank({ items: loot, collectionLog: true });
		}
		const str = `${user}, ${user.minionName} finished snooze spell casting for ${formatDuration(duration)}, you received ${loot}.`;
		return handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
