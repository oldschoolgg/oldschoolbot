import { calcBabyYagaHouseDroprate } from '@/lib/bso/bsoUtil.js';

import { } from '@oldschoolgg/rng';
import { calcPercentOfNum } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { Construction } from '@/lib/skilling/skills/construction/index.js';
import type { ConstructionActivityTaskOptions } from '@/lib/types/minions.js';

export const constructionTask: MinionTask = {
	type: 'Construction',
	async run(data: ConstructionActivityTaskOptions, { user, handleTripFinish, rng }) {
		const { objectID, quantity, channelId, duration } = data;

		const object = Construction.constructables.find(object => object.id === objectID)!;
		const xpReceived = quantity * object.xp;
		let bonusXP = 0;
		const outfitMultiplier = Construction.util.calcConBonusXP(user.gear.skilling);
		if (outfitMultiplier > 0) {
			bonusXP = calcPercentOfNum(outfitMultiplier, xpReceived);
		}
		const xpRes = await user.addXP({
			skillName: 'construction',
			amount: xpReceived + bonusXP,
			duration
		});

		const loot = new Bank();
		const petDropRate = calcBabyYagaHouseDroprate(object.xp, user.cl);
		for (let i = 0; i < quantity; i++) {
			if (rng.roll(petDropRate)) {
				loot.add('Baby yaga house');
				break;
			}
		}

		let str = `${user}, ${user.minionName} finished constructing ${quantity}x ${object.name}. ${xpRes}`;

		if (loot.length > 0) {
			await user.addItemsToBank({ items: loot, collectionLog: true });
			str += `\nYou received: ${loot}`;
		}

		if (bonusXP > 0) {
			str += `\nYou received ${bonusXP.toLocaleString()} bonus XP from your Carpenter's outfit.`;
		}

		handleTripFinish({ user, channelId, message: str, data });
	}
};
