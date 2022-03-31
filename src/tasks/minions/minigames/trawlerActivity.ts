import { calcPercentOfNum } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { ArdougneDiary, userhasDiaryTier } from '../../../lib/diaries';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { fishingTrawlerLoot } from '../../../lib/simulation/fishingTrawler';
import { SkillsEnum } from '../../../lib/skilling/types';
import { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { anglerBoostPercent } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { channelID, quantity, userID } = data;
		const user = await this.client.fetchUser(userID);

		await incrementMinigameScore(userID, 'fishing_trawler', quantity);

		const fishingLevel = user.skillLevel(SkillsEnum.Fishing);

		const allItemsOwned = user.allItemsOwned().bank;
		const loot = new Bank();

		let totalXP = 0;
		const [hasEliteArdy] = await userhasDiaryTier(user, ArdougneDiary.elite);
		for (let i = 0; i < quantity; i++) {
			const { loot: _loot, xp } = fishingTrawlerLoot(fishingLevel, hasEliteArdy, loot.clone().add(allItemsOwned));
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

		const { previousCL, itemsAdded } = await user.addItemsToBank({ items: loot, collectionLog: true });

		const currentLevel = user.skillLevel(SkillsEnum.Fishing);
		await user.addXP({ skillName: SkillsEnum.Fishing, amount: totalXP });
		const newLevel = user.skillLevel(SkillsEnum.Fishing);

		if (currentLevel !== newLevel) {
			str += `\n\n${user.minionName}'s Fishing level is now ${newLevel}!`;
		}
		const { image } = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				itemsAdded,
				`Loot From ${quantity}x Fishing Trawler`,
				true,
				{ showNewCL: 1 },
				user,
				previousCL
			);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			['minigames', { fishing_trawler: { start: {} } }, true],
			image!,
			data,
			itemsAdded
		);
	}
}
