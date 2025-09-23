import { calcPercentOfNum, roll } from 'e';
import { Bank } from 'oldschooljs';

import { calcBabyYagaHouseDroprate } from '@/lib/bso/bsoUtil.js';
import { Construction } from '@/lib/skilling/skills/construction/index.js';
import { SkillsEnum } from '@/lib/skilling/types.js';
import type { ConstructionActivityTaskOptions } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';

export const constructionTask: MinionTask = {
	type: 'Construction',
	async run(data: ConstructionActivityTaskOptions) {
		const { objectID, quantity, userID, channelID, duration } = data;
		const user = await mUserFetch(userID);
		const object = Construction.constructables.find(object => object.id === objectID)!;
		const xpReceived = quantity * object.xp;
		let bonusXP = 0;
		const outfitMultiplier = Construction.util.calcConBonusXP(user.gear.skilling);
		if (outfitMultiplier > 0) {
			bonusXP = calcPercentOfNum(outfitMultiplier, xpReceived);
		}
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Construction,
			amount: xpReceived + bonusXP,
			duration
		});

		const loot = new Bank();
		const petDropRate = calcBabyYagaHouseDroprate(object.xp, user.cl);
		for (let i = 0; i < quantity; i++) {
			if (roll(petDropRate)) {
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

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
