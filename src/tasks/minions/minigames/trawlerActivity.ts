import { calcPercentOfNum } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { fishingTrawlerLoot } from '@/lib/simulation/fishingTrawler.js';
import { Fishing } from '@/lib/skilling/skills/fishing/fishing.js';
import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

export const trawlerTask: MinionTask = {
	type: 'FishingTrawler',
	async run(data: ActivityTaskOptionsWithQuantity, { user, handleTripFinish, rng }) {
		const { channelId, quantity } = data;
		await user.incrementMinigameScore('fishing_trawler', quantity);

		const loot = new Bank();

		let totalXP = 0;
		const hasEliteArdy = user.hasDiary('ardougne.elite');
		for (let i = 0; i < quantity; i++) {
			const { loot: _loot, xp } = fishingTrawlerLoot({
				fishingLevel: user.skillsAsLevels.fishing,
				hasEliteArd: hasEliteArdy,
				bank: loot.clone().add(user.allItemsOwned),
				rng
			});
			totalXP += xp;
			loot.add(_loot);
		}

		const xpBonusPercent = Fishing.util.calcAnglerBoostPercent(user.gearBank);
		if (xpBonusPercent > 0) {
			const bonusXP = Math.ceil(calcPercentOfNum(xpBonusPercent, totalXP));
			totalXP += bonusXP;
		}

		let str = `${user}, ${
			user.minionName
		} finished completing the Fishing Trawler ${quantity}x times. ${await user.addXP({
			skillName: 'fishing',
			amount: totalXP,
			duration: data.duration
		})}`;

		if (xpBonusPercent > 0) {
			str += ` ${xpBonusPercent}% Bonus XP for Angler outfit pieces.`;
		}

		if (hasEliteArdy) str += '\n\n50% Extra fish for Ardougne Elite diary';

		const { previousCL, itemsAdded } = await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x Fishing Trawler`,
			user,
			previousCL
		});

		handleTripFinish({ user, channelId, message: { content: str, files: [image] }, data, loot: itemsAdded });
	}
};
