import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { MIN_LENGTH_FOR_PET } from '../../lib/constants';
import calcBurntCookables from '../../lib/skilling/functions/calcBurntCookables';
import Cooking from '../../lib/skilling/skills/cooking';
import { SkillsEnum } from '../../lib/skilling/types';
import { CookingActivityTaskOptions } from '../../lib/types/minions';
import { roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: CookingActivityTaskOptions) {
		const { cookableID, quantity, userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);

		const cookable = Cooking.Cookables.find(cookable => cookable.id === cookableID)!;

		let burnedAmount = 0;
		let stopBurningLvl = 0;

		if (cookable.stopBurnAtCG > 1 && user.hasItemEquippedAnywhere('Cooking gauntlets')) {
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

		const xpRes = await user.addXP(SkillsEnum.Cooking, xpReceived, duration);

		let str = `${user}, ${user.minionName} finished cooking ${quantity}x ${cookable.name}. ${xpRes}`;

		if (burnedAmount > 0) {
			str += `\n\n${burnedAmount}x ${cookable.name} failed to cook.`;
		}

		const loot = new Bank({ [cookable.id]: quantity });
		loot.remove(cookable.id, burnedAmount);
		loot.add(cookable.burntCookable, burnedAmount);

		if (duration >= MIN_LENGTH_FOR_PET) {
			const minutesInTrip = Math.ceil(duration / 1000 / 60);
			for (let i = 0; i < minutesInTrip; i++) {
				if (roll(5000)) {
					loot.add('Remy');
					str += `\n<:remy:748491189925183638> A small rat notices you cooking, and tells you you're cooking it all wrong! He crawls into your bank to help you with your cooking. You can equip Remy for a boost to your cooking skills.`;
					break;
				}
			}
		}

		str += `\nYou received: ${loot}.`;

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
			undefined,
			data,
			loot.bank
		);
	}
}
