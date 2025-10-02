import { MIN_LENGTH_FOR_PET } from '@/lib/bso/bsoConstants.js';

import { roll } from '@oldschoolgg/rng';
import { Time } from '@oldschoolgg/toolkit';
import { Bank, Items } from 'oldschooljs';

import type { AlchingActivityTaskOptions } from '@/lib/types/minions.js';

export const alchingTask: MinionTask = {
	type: 'Alching',
	async run(data: AlchingActivityTaskOptions, { user, handleTripFinish }) {
		const { itemID, quantity, channelID, alchValue, duration } = data;
		const loot = new Bank({ Coins: alchValue });

		const item = Items.getOrThrow(itemID);

		// If bryophyta's staff is equipped when starting the alch activity
		// calculate how many runes have been saved
		let savedRunes = 0;
		const hasImbuedStaff = user.hasEquippedOrInBank("Bryophyta's staff(i)");
		const hasStaff = user.hasEquipped("Bryophyta's staff");
		if (hasImbuedStaff || hasStaff) {
			for (let i = 0; i < quantity; i++) {
				if (roll(hasImbuedStaff ? 7 : 15)) savedRunes++;
			}

			if (savedRunes > 0) {
				const returnedRunes = new Bank({
					'Nature rune': savedRunes
				});

				loot.add(returnedRunes);
			}
		}

		if (duration > MIN_LENGTH_FOR_PET && roll(Math.ceil(8000 / (duration / Time.Minute)))) {
			loot.add('Lil lamb');
		}

		await user.addItemsToBank({ items: loot, collectionLog: true });
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
				'<:lil_lamb:749240864345423903> While standing at the bank alching, a small lamb, abandoned by its family, licks your minions hand. Your minion adopts the lamb.';
		}

		handleTripFinish(user, channelID, responses, undefined, data, loot);
	}
};
