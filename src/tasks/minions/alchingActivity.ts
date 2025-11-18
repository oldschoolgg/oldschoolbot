import { MIN_LENGTH_FOR_PET } from '@/lib/bso/bsoConstants.js';

import { Time } from '@oldschoolgg/toolkit';
import { Bank, Items } from 'oldschooljs';

import type { AlchingActivityTaskOptions } from '@/lib/types/minions.js';
import { BSOEmoji } from '@/lib/bso/bsoEmoji.js';

export const alchingTask: MinionTask = {
	type: 'Alching',
	async run(data: AlchingActivityTaskOptions, { user, handleTripFinish, rng }) {
		const { itemID, quantity, channelId, alchValue, duration } = data;
		const loot = new Bank().add('Coins', alchValue);

		const item = Items.getOrThrow(itemID);

		// If bryophyta's staff is equipped when starting the alch activity
		// calculate how many runes have been saved
		let savedRunes = 0;
		const hasImbuedStaff = user.hasEquippedOrInBank("Bryophyta's staff(i)");
		const hasStaff = user.hasEquipped("Bryophyta's staff");
		if (hasImbuedStaff || hasStaff) {
			for (let i = 0; i < quantity; i++) {
				if (rng.roll(hasImbuedStaff ? 7 : 15)) savedRunes++;
			}

			if (savedRunes > 0) {
				const returnedRunes = new Bank().add('Nature rune', savedRunes);
				loot.add(returnedRunes);
			}
		}

		if (duration > MIN_LENGTH_FOR_PET && rng.roll(Math.ceil(8000 / (duration / Time.Minute)))) {
			loot.add('Lil lamb');
		}

		await user.transactItems({ itemsToAdd: loot, collectionLog: true });
		await ClientSettings.updateClientGPTrackSetting('gp_alch', alchValue);

		const xpReceived = quantity * 65;
		const xpRes = await user.addXP({
			skillName: 'magic',
			amount: xpReceived,
			duration
		});

		const saved = savedRunes > 0 ? `Your Bryophyta's staff saved you ${savedRunes} Nature runes.` : '';
		let responses = [
			`${user}, ${user.minionName} has finished alching ${quantity}x ${item.name}! ${loot} has been added to your bank. ${xpRes}. ${saved}`
		].join('\n');

		if (loot.has('Lil Lamb')) {
			responses +=
				`${BSOEmoji.LilLamb} While standing at the bank alching, a small lamb, abandoned by its family, licks your minions hand. Your minion adopts the lamb.`;
		}
		return handleTripFinish({ user, channelId, message: responses, data, loot });
	}
};
