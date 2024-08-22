import { Castables } from '../../lib/skilling/skills/magic/castables';
import { SkillsEnum } from '../../lib/skilling/types';
import type { CastingActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const castingTask: MinionTask = {
	type: 'Casting',
	async run(data: CastingActivityTaskOptions) {
		const { spellID, quantity, userID, channelID, duration } = data;
		const user = await mUserFetch(userID);

		const spell = Castables.find(i => i.id === spellID)!;

		const xpReceived = quantity * spell.xp;
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Magic,
			amount: xpReceived,
			duration
		});

		let craftXpReceived = 0;
		let craftXpRes = '';
		if (spell.craftXp) {
			craftXpReceived = spell.craftXp * quantity;

			craftXpRes = await user.addXP({
				skillName: SkillsEnum.Crafting,
				amount: craftXpReceived,
				duration
			});
		}

		let prayerXpReceived = 0;
		let prayerXpRes = '';
		if (spell.prayerXp) {
			prayerXpReceived = spell.prayerXp * quantity;

			prayerXpRes = await user.addXP({
				skillName: SkillsEnum.Prayer,
				amount: prayerXpReceived,
				duration
			});
		}

		const loot = spell.output?.clone().multiply(quantity);
		if (loot) {
			await transactItems({
				userID: user.id,
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
