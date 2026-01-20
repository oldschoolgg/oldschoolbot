import { Bank, EItem, Items } from 'oldschooljs';

import type { AlchingActivityTaskOptions } from '@/lib/types/minions.js';

export const alchingTask: MinionTask = {
	type: 'Alching',
	async run(data: AlchingActivityTaskOptions, { user, handleTripFinish, rng }) {
		const { itemID, quantity, channelId, alchValue, duration } = data;
		const loot = new Bank().add('Coins', alchValue);

		const item = Items.getOrThrow(itemID);

		// If bryophyta's staff is equipped when starting the alch activity
		// calculate how many runes have been saved
		let savedRunes = 0;
		if (user.hasEquipped(EItem.BRYOPHYTAS_STAFF)) {
			for (let i = 0; i < quantity; i++) {
				if (rng.roll(15)) savedRunes++;
			}

			if (savedRunes > 0) {
				const returnedRunes = new Bank().add('Nature rune', savedRunes);
				loot.add(returnedRunes);
			}
		}
		await user.transactItems({ itemsToAdd: loot });
		await ClientSettings.updateClientGPTrackSetting('gp_alch', alchValue);

		const xpReceived = quantity * 65;
		const xpRes = await user.addXP({
			skillName: 'magic',
			amount: xpReceived,
			duration
		});

		const saved = savedRunes > 0 ? `Your Bryophyta's staff saved you ${savedRunes} Nature runes.` : '';
		const responses = [
			`${user}, ${user.minionName} has finished alching ${quantity}x ${item.name}! ${loot} has been added to your bank. ${xpRes}. ${saved}`
		].join('\n');

		return handleTripFinish({ user, channelId, message: responses, data, loot });
	}
};
