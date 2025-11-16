import { Bank } from 'oldschooljs';

import calcBurntCookables from '@/lib/skilling/functions/calcBurntCookables.js';
import Cooking from '@/lib/skilling/skills/cooking/cooking.js';
import type { CookingActivityTaskOptions } from '@/lib/types/minions.js';

export const cookingTask: MinionTask = {
	type: 'Cooking',
	async run(data: CookingActivityTaskOptions, { user, handleTripFinish }) {
		const { cookableID, quantity, channelId, duration } = data;

		const cookable = Cooking.Cookables.find(cookable => cookable.id === cookableID)!;

		let burnedAmount = 0;
		let stopBurningLvl = 0;

		const hasEasyDiary = user.hasDiary('kourend&kebos.easy');
		const hasEliteDiary = user.hasDiary('kourend&kebos.elite');
		const hasGaunts = user.hasEquipped('Cooking gauntlets');

		if (hasEasyDiary && cookable.burnKourendBonus) {
			stopBurningLvl = cookable.burnKourendBonus[(hasEliteDiary ? 1 : 0) * 2 + (hasGaunts ? 1 : 0)];
		} else if (cookable.stopBurnAtCG && hasGaunts) {
			stopBurningLvl = cookable.stopBurnAtCG;
		} else {
			stopBurningLvl = cookable.stopBurnAt;
		}

		burnedAmount = calcBurntCookables(quantity, stopBurningLvl, user.skillsAsLevels.cooking);

		const xpReceived = (quantity - burnedAmount) * cookable.xp;

		const xpRes = await user.addXP({
			skillName: 'cooking',
			amount: xpReceived,
			duration
		});

		let str = `${user}, ${user.minionName} finished cooking ${quantity}x ${cookable.name}. ${xpRes}`;

		if (burnedAmount > 0) {
			str += `\n\n${burnedAmount}x ${cookable.name} failed to cook.`;
		}

		const loot = new Bank({ [cookable.id]: quantity });
		loot.remove(cookable.id, burnedAmount);
		loot.add(cookable.burntCookable, burnedAmount);

		str += `\nYou received: ${loot}.`;

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish({ user, channelId, message: str, data, loot });
	}
};
