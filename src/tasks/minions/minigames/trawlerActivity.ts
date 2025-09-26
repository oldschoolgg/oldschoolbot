import { MysteryBoxes } from '@/lib/bso/openables/tables.js';

import { calcPercentOfNum, roll } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { ArdougneDiary, userhasDiaryTier } from '@/lib/diaries.js';
import { fishingTrawlerLoot } from '@/lib/simulation/fishingTrawler.js';
import { Fishing } from '@/lib/skilling/skills/fishing/fishing.js';
import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

export const trawlerTask: MinionTask = {
	type: 'FishingTrawler',
	isNew: true,
	async run(data: ActivityTaskOptionsWithQuantity, { user, handleTripFinish }) {
		const { channelID, quantity } = data;
		await user.incrementMinigameScore('fishing_trawler', quantity);

		const loot = new Bank();

		let totalXP = 0;
		const [hasEliteArdy] = await userhasDiaryTier(user, ArdougneDiary.elite);
		for (let i = 0; i < quantity; i++) {
			const { loot: _loot, xp } = fishingTrawlerLoot(
				user.skillsAsLevels.fishing,
				hasEliteArdy,
				loot.clone().add(user.allItemsOwned)
			);
			totalXP += xp;
			loot.add(_loot);
		}

		const xpBonusPercent = Fishing.util.calcAnglerBoostPercent(user.gearBank);
		if (xpBonusPercent > 0) {
			const bonusXP = Math.ceil(calcPercentOfNum(xpBonusPercent, totalXP));
			totalXP += bonusXP;
		}

		let str = `${user}, ${user.minionName} finished completing the Fishing Trawler ${quantity}x times.`;

		if (user.usingPet('Shelldon')) {
			loot.multiply(2);
			totalXP *= 1.5;
			str += '\nYou received **2x** extra fish from Shelldon helping you.';
		}

		str += await user.addXP({
			skillName: 'fishing',
			amount: totalXP,
			duration: data.duration
		});

		if (xpBonusPercent > 0) {
			str += ` ${xpBonusPercent}% Bonus XP for Angler outfit pieces.`;
		}

		if (hasEliteArdy) str += '\n\n50% Extra fish for Ardougne Elite diary';

		if (user.hasEquippedOrInBank('Fishing master cape')) {
			loot.multiply(4);
			for (let i = 0; i < quantity; i++) {
				if (roll(2)) loot.add(MysteryBoxes.roll());
			}
			str += '\n\nYou received **4x** extra fish because you are a master at Fishing.';
		}

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

		handleTripFinish(user, channelID, str, image.file.attachment, data, itemsAdded);
	}
};
