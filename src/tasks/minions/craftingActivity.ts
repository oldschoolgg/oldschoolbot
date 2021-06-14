import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Craftables } from '../../lib/skilling/skills/crafting/craftables';
import { SkillsEnum } from '../../lib/skilling/types';
import { CraftingActivityTaskOptions } from '../../lib/types/minions';
import { randFloat } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';

export default class extends Task {
	async run(data: CraftingActivityTaskOptions) {
		const { craftableID, quantity, userID, channelID } = data;
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Crafting);
		const item = Craftables.find(craft => craft.id === craftableID)!;

		let xpReceived = quantity * item.xp;
		const loot = new Bank();

		let crushed = 0;
		if (item.crushChance) {
			for (let i = 0; i < quantity; i++) {
				if (
					randFloat(0, 1) >
					(currentLevel - 1) * item.crushChance[0] + item.crushChance[1]
				) {
					crushed++;
				}
			}
			// crushing a gem only gives 25% exp
			xpReceived -= 0.75 * crushed * item.xp;
			loot.add('crushed gem', crushed);
		}

		const hasScroll = await user.hasItem(itemID('Scroll of dexterity'));
		if (hasScroll) {
			let _qty = quantity - crushed;
			_qty = Math.floor(_qty * 1.15);
			loot.add(item.id, _qty);
		} else {
			loot.add(item.id, quantity - crushed);
		}

		const xpRes = await user.addXP({
			skillName: SkillsEnum.Crafting,
			amount: xpReceived
		});

		let str = `${user}, ${user.minionName} finished crafting ${quantity} ${item.name}, ${
			crushed ? `crushing ${crushed} of them` : ``
		}. ${xpRes}`;

		if (hasScroll) {
			str += `\n\nYour Scroll of dexterity allows you to receive 15% extra items.`;
		}

		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${item.name}`);
				return this.client.commands.get('craft')!.run(res, [quantity, item.name]);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
