import { increaseNumByPercent, randInt } from 'e';
import { Task } from 'klasa';

import { Emoji, Events } from '../../../lib/constants';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { getTemporossLoot } from '../../../lib/simulation/tempoross';
import Fishing from '../../../lib/skilling/skills/fishing';
import { SkillsEnum } from '../../../lib/skilling/types';
import { TemporossActivityTaskOptions } from '../../../lib/types/minions';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: TemporossActivityTaskOptions) {
		const { userID, channelID, quantity, rewardBoost, duration } = data;
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Fishing);
		const { previousScore, newScore } = await incrementMinigameScore(userID, 'Tempoross', quantity);
		const kcForPet = randInt(previousScore, newScore);

		let rewardTokens = quantity * 6;
		if (rewardBoost > 0) {
			rewardTokens = Math.ceil(increaseNumByPercent(rewardTokens, rewardBoost));
		}
		const loot = getTemporossLoot(rewardTokens, currentLevel, user.bank());

		if (loot.has('Tiny tempor')) {
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.TinyTempor} **${user.username}'s** minion, ${
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
			user.getGear('skilling').hasEquipped(
				Object.keys(Fishing.anglerItems).map(i => parseInt(i)),
				true
			)
		) {
			const amountToAdd = Math.floor(fXPtoGive * (2.5 / 100));
			fXPtoGive += amountToAdd;
			fBonusXP += amountToAdd;
		} else {
			// For each angler item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Fishing.anglerItems)) {
				if (user.hasItemEquippedAnywhere(parseInt(itemID))) {
					const amountToAdd = Math.floor(fXPtoGive * (bonus / 100));
					fXPtoGive += amountToAdd;
					fBonusXP += amountToAdd;
				}
			}
		}

		const xpStr = await user.addXP({ skillName: SkillsEnum.Fishing, amount: fXPtoGive, duration });

		const { previousCL } = await user.addItemsToBank(loot, true);

		const { image } = await this.client.tasks.get('bankImage')!.generateBankImage(
			loot.bank,
			`${rewardTokens} reward pool rolls`,
			true,
			{
				showNewCL: 1
			},
			user,
			previousCL
		);

		let output = `${user}, ${
			user.minionName
		} finished fighting Tempoross ${quantity}x times. ${xpStr.toLocaleString()}`;

		if (fBonusXP > 0) {
			output += `\n\n**Fishing Bonus XP:** ${fBonusXP.toLocaleString()}`;
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			output,
			res => {
				user.log('continued trip of Tempoross');
				return this.client.commands.get('tempoross')!.run(res, [quantity]);
			},
			image!,
			data,
			loot.bank
		);
	}
}
