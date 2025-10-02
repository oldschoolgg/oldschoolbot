import { calcPerHour, increaseNumByPercent } from '@oldschoolgg/toolkit';

import { getTemporossLoot } from '@/lib/simulation/tempoross.js';
import { Fishing } from '@/lib/skilling/skills/fishing/fishing.js';
import type { TemporossActivityTaskOptions } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

export const temporossTask: MinionTask = {
	type: 'Tempoross',
	async run(data: TemporossActivityTaskOptions, { user, handleTripFinish }) {
		const { channelID, quantity, rewardBoost, duration } = data;

		const currentLevel = user.skillsAsLevels.fishing;
		const { newScore } = await user.incrementMinigameScore('tempoross', quantity);

		let rewardTokens = quantity * 6;
		if (rewardBoost > 0) {
			rewardTokens = Math.ceil(increaseNumByPercent(rewardTokens, rewardBoost));
		}
		const loot = getTemporossLoot(rewardTokens, currentLevel, user.bank);

		let fXPtoGive = quantity * 5500 * (currentLevel / 40);
		let fBonusXP = 0;

		// If they have the entire angler outfit, give an extra 0.5% xp bonus
		if (
			user.gear.skilling.hasEquipped(
				Fishing.anglerItems.map(i => i[1]),
				true
			)
		) {
			const amountToAdd = Math.floor(fXPtoGive * (2.5 / 100));
			fXPtoGive += amountToAdd;
			fBonusXP += amountToAdd;
		} else {
			// For each angler item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Fishing.anglerItems) {
				if (user.hasEquipped(itemID)) {
					const amountToAdd = Math.floor(fXPtoGive * (bonus / 100));
					fXPtoGive += amountToAdd;
					fBonusXP += amountToAdd;
				}
			}
		}

		const xpStr = await user.addXP({
			skillName: 'fishing',
			amount: fXPtoGive,
			duration,
			source: 'Tempoross'
		});

		const { previousCL, itemsAdded } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `${rewardTokens} reward pool rolls`,
			user,
			previousCL
		});

		let output = `${user}, ${
			user.minionName
		} finished fighting Tempoross ${quantity}x times (${calcPerHour(quantity, data.duration).toFixed(1)}/hr), you now have ${newScore} KC. ${xpStr.toLocaleString()}`;

		if (fBonusXP > 0) {
			output += `\n\n**Fishing Bonus XP:** ${fBonusXP.toLocaleString()}`;
		}

		handleTripFinish(user, channelID, output, image.file.attachment, data, itemsAdded);
	}
};
