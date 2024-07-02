import { Bank } from 'oldschooljs';

import { Craftables } from '../../lib/skilling/skills/crafting/craftables';
import { SkillsEnum } from '../../lib/skilling/types';
import type { CraftingActivityTaskOptions } from '../../lib/types/minions';
import { randFloat } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const craftingTask: MinionTask = {
	type: 'Crafting',
	async run(data: CraftingActivityTaskOptions) {
		const { craftableID, quantity, userID, channelID, duration } = data;
		const user = await mUserFetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Crafting);
		const item = Craftables.find(craft => craft.id === craftableID)!;

		let xpReceived = quantity * item.xp;
		let sets = 'x';
		if (item.outputMultiple) {
			sets = ' sets of';
		}
		const quantityToGive = item.outputMultiple ? quantity * item.outputMultiple : quantity;
		const loot = new Bank();

		let crushed = 0;
		if (item.crushChance) {
			for (let i = 0; i < quantity; i++) {
				if (randFloat(0, 1) > (currentLevel - 1) * item.crushChance[0] + item.crushChance[1]) {
					crushed++;
				}
			}
			// crushing a gem only gives 25% exp
			xpReceived -= 0.75 * crushed * item.xp;
			loot.add('crushed gem', crushed);
		}
		loot.add(item.id, quantityToGive - crushed);

		const xpRes = await user.addXP({ skillName: SkillsEnum.Crafting, amount: xpReceived, duration });

		const str = `${user}, ${user.minionName} finished crafting ${quantity}${sets} ${item.name}, and received ${loot}. ${xpRes}`;

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
