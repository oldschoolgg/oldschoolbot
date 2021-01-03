import { Task } from 'klasa';

import calcBurntCookables from '../../lib/skilling/functions/calcBurntCookables';
import Cooking from '../../lib/skilling/skills/cooking';
import { SkillsEnum } from '../../lib/skilling/types';
import { CookingActivityTaskOptions } from '../../lib/types/minions';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';

export default class extends Task {
	async run(data: CookingActivityTaskOptions) {
		const { cookableID, quantity, userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Cooking);

		const cookable = Cooking.Cookables.find(cookable => cookable.id === cookableID);
		if (!cookable) return;

		let burnedAmount = 0;
		let stopBurningLvl = 0;

		if (
			cookable.stopBurnAtCG > 1 &&
			user.hasItemEquippedAnywhere(itemID('Cooking gauntlets'))
		) {
			stopBurningLvl = cookable.stopBurnAtCG;
		} else {
			stopBurningLvl = cookable.stopBurnAt;
		}

		burnedAmount = calcBurntCookables(
			quantity,
			stopBurningLvl,
			user.skillLevel(SkillsEnum.Cooking)
		);

		const xpReceived = (quantity - burnedAmount) * cookable.xp;

		await user.addXP(SkillsEnum.Cooking, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Cooking);

		let str = `${user}, ${user.minionName} finished cooking ${quantity}x ${
			cookable.name
		}, you also received ${xpReceived.toLocaleString()} XP.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Cooking level is now ${newLevel}!`;
		}

		if (burnedAmount > 0) {
			str += `\n\n${burnedAmount}x ${cookable.name} failed to cook.`;
		}

		const loot = {
			[cookable.id]: quantity - burnedAmount
		};

		loot[cookable.burntCookable] = burnedAmount;

		str += `\nYou received: ${await createReadableItemListFromBank(this.client, loot)}.`;

		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x ${cookable.name}[${cookable.id}]`);
				return this.client.commands.get('cook')!.run(res, [quantity, cookable.name]);
			},
			data
		);
	}
}
