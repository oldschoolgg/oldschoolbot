import { Bank, Items } from 'oldschooljs';

import type { AlchingActivityTaskOptions } from '@/lib/types/minions.js';
import { calculateBryophytaRuneSavings } from '@/lib/util/bryophytaRuneSavings.js';

export const alchingTask: MinionTask = {
	type: 'Alching',
	async run(data: AlchingActivityTaskOptions, { user, handleTripFinish }) {
		const { itemID, quantity, channelID, alchValue, duration } = data;
		const loot = new Bank({ Coins: alchValue });

		const item = Items.getOrThrow(itemID);

		// If bryophyta's staff is equipped when starting the alch activity
		// calculate how many runes have been saved
		const { savedRunes, savedBank } = calculateBryophytaRuneSavings({ user, quantity });
		if (savedBank) {
			loot.add(savedBank);
		}
		await user.addItemsToBank({ items: loot });
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

		handleTripFinish(user, channelID, responses, undefined, data, loot);
	}
};
