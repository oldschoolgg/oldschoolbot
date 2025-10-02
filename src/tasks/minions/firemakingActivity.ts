import Firemaking from '@/lib/skilling/skills/firemaking.js';
import type { FiremakingActivityTaskOptions } from '@/lib/types/minions.js';

export const firemakingTask: MinionTask = {
	type: 'Firemaking',
	async run(data: FiremakingActivityTaskOptions, { user, handleTripFinish }) {
		const { burnableID, quantity, channelID } = data;

		const burnable = Firemaking.Burnables.find(Burn => Burn.inputLogs === burnableID)!;

		let xpReceived = quantity * burnable.xp;
		let bonusXP = 0;

		// If they have the entire pyromancer outfit, give an extra 0.5% xp bonus
		if (
			user.hasEquippedOrInBank(
				Object.keys(Firemaking.pyromancerItems).map(i => Number.parseInt(i)),
				'every'
			)
		) {
			const amountToAdd = Math.floor(xpReceived * (2.5 / 100));
			xpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each pyromancer item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Firemaking.pyromancerItems)) {
				if (user.hasEquippedOrInBank(Number.parseInt(itemID))) {
					const amountToAdd = Math.floor(xpReceived * (bonus / 100));
					xpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}

		const xpRes = await user.addXP({
			skillName: 'firemaking',
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
