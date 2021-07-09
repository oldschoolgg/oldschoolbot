import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Craftables } from '../../lib/skilling/skills/crafting/craftables';
import { SkillsEnum } from '../../lib/skilling/types';
import { CraftingActivityTaskOptions } from '../../lib/types/minions';
import { randFloat } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: CraftingActivityTaskOptions) {
		const { craftableID, quantity, userID, channelID, quantitySpecified } = data;
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Crafting);
		const item = Craftables.find(craft => craft.id === craftableID)!;

		let xpReceived = quantity * item.xp;
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
		loot.add(item.id, quantity - crushed);

		const xpRes = await user.addXP({ skillName: SkillsEnum.Crafting, amount: xpReceived });

		let str = `${user}, ${user.minionName} finished crafting ${quantity} ${item.name}${
			crushed ? `, crushing ${crushed} of them` : ''
		}. ${xpRes}`;

		await user.addItemsToBank(loot.values(), true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${item.name}`);
				return this.client.commands.get('craft')!.run(res, [quantitySpecified ? quantity : null, item.name]);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
