import { roll, Time } from 'e';
import { Bank } from 'oldschooljs';

import { clAdjustedDroprate } from './util';
import { TripFinishEffect } from './util/handleTripFinish';

const petChancePerHour = 30;
const chancePerMinute = petChancePerHour * 60;

export const beeHiveTripEffect: TripFinishEffect = {
	name: 'Beehive',
	fn: async ({ user, data, messages }) => {
		if (!user.owns('Beehive')) return;
		let minutes = Math.floor(data.duration / Time.Minute);
		if (minutes < 1) return;

		const loot = new Bank();
		const petDroprate = clAdjustedDroprate(user, 'Buzz', chancePerMinute, 5);
		for (let i = 0; i < minutes; i++) {
			if (roll(petDroprate)) loot.add('Buzz');
			if (roll(183)) {
				loot.add('Honey');
			}
			if (roll(433)) {
				loot.add('Honeycomb');
			}
		}

		if (loot.length === 0) return;
		await user.addItemsToBank({ items: loot, collectionLog: true });
		messages.push(`You checked your Beehive and found... ${loot}.`);
	}
};
