import { Task } from 'klasa';

import { hasArrayOfItemsEquipped } from '../../lib/gear';
import Firemaking from '../../lib/skilling/skills/firemaking';
import { SkillsEnum } from '../../lib/skilling/types';
import { FiremakingActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: FiremakingActivityTaskOptions) {
		const { burnableID, quantity, userID, channelID } = data;
		const user = await this.client.users.fetch(userID);

		const burnable = Firemaking.Burnables.find(Burn => Burn.inputLogs === burnableID)!;

		let xpReceived = quantity * burnable.xp;
		let bonusXP = 0;

		// If they have the entire pyromancer outfit, give an extra 0.5% xp bonus
		if (
			hasArrayOfItemsEquipped(
				Object.keys(Firemaking.pyromancerItems).map(i => parseInt(i)),
				user.getGear('skilling')
			)
		) {
			const amountToAdd = Math.floor(xpReceived * (2.5 / 100));
			xpReceived += amountToAdd;
			bonusXP += amountToAdd;
		} else {
			// For each pyromancer item, check if they have it, give its' XP boost if so.
			for (const [itemID, bonus] of Object.entries(Firemaking.pyromancerItems)) {
				if (user.hasItemEquippedAnywhere(parseInt(itemID))) {
					const amountToAdd = Math.floor(xpReceived * (bonus / 100));
					xpReceived += amountToAdd;
					bonusXP += amountToAdd;
				}
			}
		}

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Firemaking,
			amount: xpReceived
		});

		let str = `${user}, ${user.minionName} finished lighting ${quantity} ${burnable.name}. ${xpRes}`;

		if (bonusXP > 0) {
			str += `\n\n**Bonus XP:** ${bonusXP.toLocaleString()}`;
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${burnable.name}`);
				return this.client.commands.get('light')!.run(res, [quantity, burnable.name]);
			},
			undefined,
			data,
			null
		);
	}
}
