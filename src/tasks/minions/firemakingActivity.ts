import Firemaking from '../../lib/skilling/skills/firemaking';
import { SkillsEnum } from '../../lib/skilling/types';
import type { FiremakingActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const firemakingTask: MinionTask = {
	type: 'Firemaking',
	async run(data: FiremakingActivityTaskOptions) {
		const { burnableID, quantity, userID, channelID } = data;
		const user = await mUserFetch(userID);

		const burnable = Firemaking.Burnables.find(Burn => Burn.inputLogs === burnableID)!;

		let xpReceived = quantity * burnable.xp;
		let bonusXP = 0;

		// If they have the entire pyromancer outfit, give an extra 0.5% xp bonus
		if (
<<<<<<< HEAD
			user.hasEquippedOrInBank(
				Object.keys(Firemaking.pyromancerItems).map(i => Number.parseInt(i)),
				'every'
=======
			user.gear.skilling.hasEquipped(
				Object.keys(Firemaking.pyromancerItems).map(i => Number.parseInt(i)),
				true
>>>>>>> master
			)
		) {
			const amountToAdd = Math.floor(xpReceived * (2.5 / 100));
			xpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each pyromancer item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Firemaking.pyromancerItems)) {
<<<<<<< HEAD
				if (user.hasEquippedOrInBank(Number.parseInt(itemID))) {
=======
				if (user.hasEquipped(Number.parseInt(itemID))) {
>>>>>>> master
					const amountToAdd = Math.floor(xpReceived * (bonus / 100));
					xpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Firemaking,
			amount: xpReceived,
			duration: data.duration
		});

		let str = `${user}, ${user.minionName} finished lighting ${quantity} ${burnable.name}. ${xpRes}`;

		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
