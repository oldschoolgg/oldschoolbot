import { calcPercentOfNum } from 'e';
import { Bank } from 'oldschooljs';

import { ArdougneDiary, userhasDiaryTier } from '../../../lib/diaries';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { fishingTrawlerLoot } from '../../../lib/simulation/fishingTrawler';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import { anglerBoostPercent } from '../../../mahoji/mahojiSettings';

export const trawlerTask: MinionTask = {
	type: 'FishingTrawler',
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { channelID, quantity, userID } = data;
		const user = await mUserFetch(userID);
		await incrementMinigameScore(userID, 'fishing_trawler', quantity);

		const fishingLevel = user.skillLevel(SkillsEnum.Fishing);

		const loot = new Bank();

		let totalXP = 0;
		const [hasEliteArdy] = await userhasDiaryTier(user, ArdougneDiary.elite);
		for (let i = 0; i < quantity; i++) {
			const { loot: _loot, xp } = fishingTrawlerLoot(
				fishingLevel,
				hasEliteArdy,
				loot.clone().add(user.allItemsOwned)
			);
			totalXP += xp;
			loot.add(_loot);
		}

		const xpBonusPercent = anglerBoostPercent(user);
		if (xpBonusPercent > 0) {
			const bonusXP = Math.ceil(calcPercentOfNum(xpBonusPercent, totalXP));
			totalXP += bonusXP;
		}

		let str = `${user}, ${
			user.minionName
		} finished completing the Fishing Trawler ${quantity}x times. ${await user.addXP({
			skillName: SkillsEnum.Fishing,
			amount: totalXP,
			duration: data.duration
		})}`;

		if (xpBonusPercent > 0) {
			str += ` ${xpBonusPercent}% Bonus XP for Angler outfit pieces.`;
		}

		if (hasEliteArdy) str += '\n\n50% Extra fish for Ardougne Elite diary';

		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x Fishing Trawler`,
			user,
			previousCL
		});

		handleTripFinish(user, channelID, str, image.file.attachment, data, itemsAdded);
	}
};
