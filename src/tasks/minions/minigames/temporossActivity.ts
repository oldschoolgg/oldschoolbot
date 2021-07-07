import { increaseNumByPercent } from 'e';
import { Task } from 'klasa';

import { Emoji, Events } from '../../../lib/constants';
import { getTemporossLoot } from '../../../lib/simulation/tempoross';
import Fishing from '../../../lib/skilling/skills/fishing';
import { SkillsEnum } from '../../../lib/skilling/types';
import { ItemBank } from '../../../lib/types';
import { TemporossActivityTaskOptions } from '../../../lib/types/minions';
import { bankHasItem, channelIsSendable } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import itemID from '../../../lib/util/itemID';

export default class extends Task {
	async run(data: TemporossActivityTaskOptions) {
		const { userID, channelID, quantity, rewardBoost, duration } = data;
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Fishing);
		const channel = await this.client.channels.fetch(channelID);

		let loot: ItemBank = {};
		let rewardTokens = quantity * 10;
		if (rewardBoost > 0) {
			rewardTokens = Math.ceil(increaseNumByPercent(rewardTokens, rewardBoost));
		}

		loot = getTemporossLoot(rewardTokens, currentLevel, user.bank()).bank;

		if (bankHasItem(loot, itemID('Tiny tempor'))) {
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.TinyTempor} **${user.username}'s** minion, ${
					user.minionName
				}, just received a Tiny tempor! Their Tempoross KC is ${
					(await user.getMinigameScore('Tempoross')) + quantity
				}, and their Fishing level is ${currentLevel}.`
			);
		}

		let fXPtoGive = quantity * 12250;
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
		user.incrementMinigameScore('Tempoross', quantity);

		const { image } = await this.client.tasks.get('bankImage')!.generateBankImage(
			loot,
			`${rewardTokens} reward pool rolls`,
			true,
			{
				showNewCL: 1
			},
			user,
			previousCL
		);

		if (!channelIsSendable(channel)) return;

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
			loot
		);
	}
}
