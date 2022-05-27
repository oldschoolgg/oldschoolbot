import { increaseNumByPercent } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Craftables } from '../../lib/skilling/skills/crafting/craftables';
import { SkillsEnum } from '../../lib/skilling/types';
import { CraftingActivityTaskOptions } from '../../lib/types/minions';
import { randFloat } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: CraftingActivityTaskOptions) {
		const { craftableID, quantity, userID, channelID, duration } = data;
		const user = await this.client.fetchUser(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Crafting);
		const item = Craftables.find(craft => craft.id === craftableID)!;

		let xpReceived = quantity * item.xp;
		let sets = 'x';
		if (item.outputMultiple) {
			sets = ' sets of';
		}
		let quantityToGive = item.outputMultiple ? quantity * item.outputMultiple : quantity;
		const loot = new Bank();

		let crushed = 0;
		if (item.crushChance) {
			for (let i = 0; i < quantityToGive; i++) {
				if (randFloat(0, 1) > (currentLevel - 1) * item.crushChance[0] + item.crushChance[1]) {
					crushed++;
				}
			}
			// crushing a gem only gives 25% exp
			xpReceived -= 0.75 * crushed * item.xp;
			loot.add('crushed gem', crushed);
		}

		const hasScroll = user.owns('Scroll of dexterity');
		if (hasScroll) {
			let _qty = quantityToGive - crushed;
			_qty = Math.floor(increaseNumByPercent(_qty, 15));
			loot.add(item.id, _qty);
		} else {
			loot.add(item.id, quantityToGive - crushed);
		}

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Crafting,
			amount: xpReceived,
			duration
		});

		let str = `${user}, ${user.minionName} finished crafting ${quantity}${sets} ${item.name}, and received ${loot}.${xpRes}`;

		if (hasScroll) {
			str += '\n\nYour Scroll of dexterity allows you to receive 15% extra items.';
		}

		await user.addItemsToBank({ items: loot, collectionLog: true });

		handleTripFinish(user, channelID, str, ['craft', { name: item.name, quantity }], undefined, data, loot);
	}
}
