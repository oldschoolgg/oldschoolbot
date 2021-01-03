import { KlasaUser, Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { MinigameIDsEnum } from '../../../lib/minions/data/minigames';
import { fishingTrawlerLoot } from '../../../lib/simulation/fishingTrawler';
import { SkillsEnum } from '../../../lib/skilling/types';
import { FishingTrawlerActivityTaskOptions } from '../../../lib/types/minions';
import { addBanks, anglerBoostPercent, calcPercentOfNum } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { skillsMeetRequirements } from '../../../lib/util/skillsMeetRequirements';

function hasEliteArdougneDiary(user: KlasaUser): boolean {
	return skillsMeetRequirements(user.rawSkills, {
		agility: 90,
		cooking: 91,
		crafting: 35,
		firemaking: 50,
		fishing: 81,
		fletching: 69,
		smithing: 91
	});
}

export default class extends Task {
	async run(data: FishingTrawlerActivityTaskOptions) {
		const { channelID, quantity, duration, userID } = data;
		const user = await this.client.users.fetch(userID);

		user.incrementMinionDailyDuration(duration);
		user.incrementMinigameScore(MinigameIDsEnum.FishingTrawler, quantity);

		const fishingLevel = user.skillLevel(SkillsEnum.Fishing);

		const allItemsOwned = user.allItemsOwned();
		const loot = new Bank();

		let totalXP = 0;
		for (let i = 0; i < quantity; i++) {
			const { loot: _loot, xp } = fishingTrawlerLoot(
				fishingLevel,
				hasEliteArdougneDiary(user),
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

		await user.addItemsToBank(loot.bank, true);

		const currentLevel = user.skillLevel(SkillsEnum.Fishing);
		await user.addXP(SkillsEnum.Fishing, totalXP);
		const newLevel = user.skillLevel(SkillsEnum.Fishing);

		if (currentLevel !== newLevel) {
			str += `\n\n${user.minionName}'s Fishing level is now ${newLevel}!`;
		}
		const image = await this.client.tasks
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
			data,
			image,
			loot.bank
		);
	}
}
