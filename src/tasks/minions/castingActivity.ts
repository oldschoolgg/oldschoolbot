import { itemID } from 'oldschooljs';

import { Castables } from '@/lib/skilling/skills/magic/castables.js';
import type { CastingActivityTaskOptions } from '@/lib/types/minions.js';

export const castingTask: MinionTask = {
	type: 'Casting',
	async run(data: CastingActivityTaskOptions, { user, handleTripFinish }) {
		const { spellID, quantity, channelId, duration } = data;

		const spell = Castables.find(i => i.id === spellID)!;

		const xpReceived = quantity * spell.xp;
		const xpRes = await user.addXP({
			skillName: 'magic',
			amount: xpReceived,
			duration
		});

		let craftXpReceived = 0;
		let craftXpRes = '';
		if (spell.craftXp) {
			craftXpReceived = spell.craftXp * quantity;

			craftXpRes = await user.addXP({
				skillName: 'crafting',
				amount: craftXpReceived,
				duration
			});
		}

		let prayerXpReceived = 0;
		let prayerXpRes = '';
		if (spell.prayerXp) {
			prayerXpReceived = spell.prayerXp * quantity;

			prayerXpRes = await user.addXP({
				skillName: 'prayer',
				amount: prayerXpReceived,
				duration
			});
		}

		let smithXpReceived = 0;
		let smithXpRes = '';
		if (spell.smithingXp) {
			if (spell.id === itemID('Gold bar') && user.hasEquipped('Goldsmith gauntlets')) {
				smithXpReceived = 56.2 * quantity;
			} else {
				smithXpReceived = spell.smithingXp * quantity;
			}

			smithXpRes = await user.addXP({
				skillName: 'smithing',
				amount: smithXpReceived,
				duration
			});
		}

		const loot = spell.output?.clone().multiply(quantity);
		if (loot) {
			await user.transactItems({
				collectionLog: true,
				itemsToAdd: loot
			});
		}

		const str = `${user}, ${user.minionName} finished casting ${quantity}x ${spell.name}, you received ${
			loot ?? 'no items'
		}. ${xpRes} ${craftXpRes}${prayerXpRes}${smithXpRes}`;

		handleTripFinish({ user, channelId, message: str, data, loot: loot ?? null });
	}
};
