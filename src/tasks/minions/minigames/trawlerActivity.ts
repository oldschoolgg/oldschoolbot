import { calcPercentOfNum, roll } from 'e';
import { Bank } from 'oldschooljs';

import { MysteryBoxes } from '../../../lib/bsoOpenables';
import { ArdougneDiary, userhasDiaryTier } from '../../../lib/diaries';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { fishingTrawlerLoot } from '../../../lib/simulation/fishingTrawler';
import { SkillsEnum } from '../../../lib/skilling/types';
import { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
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

		const allItemsOwnedBank = user.allItemsOwned().bank;
		const loot = new Bank();

		let totalXP = 0;
		const [hasEliteArdy] = await userhasDiaryTier(user, ArdougneDiary.elite);
		for (let i = 0; i < quantity; i++) {
			const { loot: _loot, xp } = fishingTrawlerLoot(
				fishingLevel,
				hasEliteArdy,
				loot.clone().add(allItemsOwnedBank)
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
		} finished completing the Fishing Trawler ${quantity}x times. You received ${await user.addXP({
			skillName: SkillsEnum.Fishing,
			amount: totalXP
		})}`;

		if (xpBonusPercent > 0) {
			str += ` ${xpBonusPercent}% Bonus XP for Angler outfit pieces.`;
		}

		if (hasEliteArdy) str += '\n\n50% Extra fish for Ardougne Elite diary';

		if (user.hasEquipped('Fishing master cape')) {
			loot.multiply(4);
			for (let i = 0; i < quantity; i++) {
				if (roll(2)) loot.add(MysteryBoxes.roll());
			}
			str += '\n\nYou received **4x** extra fish because you are a master at Fishing.';
		}

		if (user.usingPet('Shelldon')) {
			loot.multiply(2);
			totalXP *= 1.5;
			str += '\nYou received **2x** extra fish from Shelldon helping you.';
		}

		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		const currentLevel = user.skillLevel(SkillsEnum.Fishing);
		await user.addXP({ skillName: SkillsEnum.Fishing, amount: totalXP });
		const newLevel = user.skillLevel(SkillsEnum.Fishing);

		if (currentLevel !== newLevel) {
			str += `\n\n${user.minionName}'s Fishing level is now ${newLevel}!`;
		}

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x Fishing Trawler`,
			user,
			previousCL
		});

		handleTripFinish(
			user,
			channelID,
			str,
			['minigames', { fishing_trawler: { start: {} } }, true],
			image.file.buffer,
			data,
			itemsAdded
		);
	}
};
