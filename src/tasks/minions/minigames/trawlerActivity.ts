import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { getRandomMysteryBox } from '../../../lib/data/openables';
import { ArdougneDiary, userhasDiaryTier } from '../../../lib/diaries';
import { fishingTrawlerLoot } from '../../../lib/simulation/fishingTrawler';
import { SkillsEnum } from '../../../lib/skilling/types';
import { FishingTrawlerActivityTaskOptions } from '../../../lib/types/minions';
import { addBanks, anglerBoostPercent, calcPercentOfNum, itemID, roll } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: FishingTrawlerActivityTaskOptions) {
		const { channelID, quantity, userID } = data;
		const user = await this.client.users.fetch(userID);

		user.incrementMinigameScore('FishingTrawler', quantity);

		const fishingLevel = user.skillLevel(SkillsEnum.Fishing);

		const allItemsOwned = user.allItemsOwned().bank;
		const loot = new Bank();

		let totalXP = 0;
		const [hasEliteArdy] = await userhasDiaryTier(user, ArdougneDiary.elite);
		for (let i = 0; i < quantity; i++) {
			const { loot: _loot, xp } = fishingTrawlerLoot(
				fishingLevel,
				hasEliteArdy,
				addBanks([loot.bank, allItemsOwned])
			);
			totalXP += xp;
			loot.add(_loot);
		}

		let str = `${user}, ${
			user.minionName
		} finished completing the Fishing Trawler ${quantity}x times. You received ${totalXP.toLocaleString()} Fishing XP.`;

		const xpBonusPercent = anglerBoostPercent(user);
		if (xpBonusPercent > 0) {
			const bonusXP = Math.ceil(calcPercentOfNum(xpBonusPercent, totalXP));
			str += `\n\n${xpBonusPercent}% Bonus XP (${bonusXP}) for Angler outfit pieces.`;
			totalXP += bonusXP;
		}

		if (user.hasItemEquippedAnywhere(itemID('Fishing master cape'))) {
			loot.multiply(4);
			for (let i = 0; i < quantity; i++) {
				if (roll(2)) loot.add(getRandomMysteryBox());
			}
			str += `\n\nYou received **4x** extra fish because you are a master at Fishing.`;
		}

		if (user.usingPet('Shelldon')) {
			loot.multiply(2);
			totalXP *= 1.5;
			str += `\nYou received **2x** extra fish from Shelldon helping you.`;
		}

		await user.addItemsToBank(loot.bank, true);

		const currentLevel = user.skillLevel(SkillsEnum.Fishing);
		await user.addXP({ skillName: SkillsEnum.Fishing, amount: totalXP });
		const newLevel = user.skillLevel(SkillsEnum.Fishing);

		if (currentLevel !== newLevel) {
			str += `\n\n${user.minionName}'s Fishing level is now ${newLevel}!`;
		}
		const { image } = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				loot.bank,
				`Loot From ${quantity}x Fishing Trawler`,
				true,
				{ showNewCL: 1 },
				user
			);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued fishing trawler`);
				return this.client.commands.get('fishingtrawler')!.run(res, []);
			},
			image!,
			data,
			loot.bank
		);
	}
}
