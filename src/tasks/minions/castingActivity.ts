import { Castables } from '@/lib/skilling/skills/magic/castables.js';
import type { CastingActivityTaskOptions } from '@/lib/types/minions.js';

export const castingTask: MinionTask = {
	type: 'Casting',
	async run(data: CastingActivityTaskOptions, { user, handleTripFinish }) {
		const { spellID, quantity, channelID, duration } = data;

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

		const loot = spell.output?.clone().multiply(quantity);
		if (loot) {
			await user.transactItems({
				collectionLog: true,
				itemsToAdd: loot
			});
		}

		const str = `${user}, ${user.minionName} finished casting ${quantity}x ${spell.name}, you received ${
			loot ?? 'no items'
		}. ${xpRes} ${craftXpRes}${prayerXpRes}`;

		handleTripFinish(user, channelID, str, undefined, data, loot ?? null);
	}
};
