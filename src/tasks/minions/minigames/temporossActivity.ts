import { calcPerHour, formatOrdinal } from '@oldschoolgg/toolkit/util';
import { increaseNumByPercent, randInt } from 'e';

import { Emoji, Events } from '../../../lib/constants';
import { getMinigameEntity, incrementMinigameScore } from '../../../lib/settings/settings';
import { getTemporossLoot } from '../../../lib/simulation/tempoross';
import Fishing from '../../../lib/skilling/skills/fishing';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { TemporossActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';

export const temporossTask: MinionTask = {
	type: 'Tempoross',
	async run(data: TemporossActivityTaskOptions) {
		const { userID, channelID, quantity, rewardBoost, duration } = data;
		const user = await mUserFetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Fishing);
		const previousScore = (await getMinigameEntity(user.id)).tempoross;
		const { newScore } = await incrementMinigameScore(userID, 'tempoross', quantity);
		const kcForPet = randInt(previousScore, newScore);

		let rewardTokens = quantity * 6;
		if (rewardBoost > 0) {
			rewardTokens = Math.ceil(increaseNumByPercent(rewardTokens, rewardBoost));
		}
		const loot = getTemporossLoot(rewardTokens, currentLevel, user.bank);

		if (loot.has('Tiny tempor')) {
			globalClient.emit(
				Events.ServerNotification,
				`${Emoji.TinyTempor} **${user.badgedUsername}'s** minion, ${
					user.minionName
				}, just received a Tiny tempor! They got the pet on the ${formatOrdinal(
					kcForPet
				)} kill, and their Fishing level is ${currentLevel}.`
			);
		}

		let fXPtoGive = quantity * 5500 * (currentLevel / 40);
		let fBonusXP = 0;

		// If they have the entire angler outfit, give an extra 0.5% xp bonus
		if (
			user.gear.skilling.hasEquipped(
				Object.keys(Fishing.anglerItems).map(i => Number.parseInt(i)),
				true
			)
		) {
			const amountToAdd = Math.floor(fXPtoGive * (2.5 / 100));
			fXPtoGive += amountToAdd;
			fBonusXP += amountToAdd;
		} else {
			// For each angler item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Fishing.anglerItems)) {
				if (user.hasEquipped(Number.parseInt(itemID))) {
					const amountToAdd = Math.floor(fXPtoGive * (bonus / 100));
					fXPtoGive += amountToAdd;
					fBonusXP += amountToAdd;
				}
			}
		}

		const xpStr = await user.addXP({
			skillName: SkillsEnum.Fishing,
			amount: fXPtoGive,
			duration,
			source: 'Tempoross'
		});

		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
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
