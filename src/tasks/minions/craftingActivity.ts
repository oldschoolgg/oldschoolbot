import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Time } from '../../lib/constants';
import { getRandomMysteryBox } from '../../lib/data/openables';
import Crafting from '../../lib/skilling/skills/crafting/';
import { SkillsEnum } from '../../lib/skilling/types';
import { CraftingActivityTaskOptions } from '../../lib/types/minions';
import { multiplyBank, randFloat, roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: CraftingActivityTaskOptions) {
		const { craftableID, quantity, userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Crafting);

		const Craft = Crafting.Craftables.find(craft => craft.id === craftableID);

		if (!Craft) return;
		let xpReceived = quantity * Craft.xp;
		const loot = new Bank();

		let crushed = 0;
		if (Craft.crushChance) {
			for (let i = 0; i < quantity; i++) {
				if (
					randFloat(0, 1) >
					(currentLevel - 1) * Craft.crushChance[0] + Craft.crushChance[1]
				) {
					crushed++;
				}
			}
			// crushing a gem only gives 25% exp
			xpReceived -= 0.75 * crushed * Craft.xp;
			loot.add('Crushed gem', crushed);
		}

		loot.add(Craft.id, Craft.crushChance ? quantity - crushed : quantity);

		await user.addXP(SkillsEnum.Crafting, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Crafting);

		let str = `${user}, ${user.minionName} finished crafting ${quantity} ${Craft.name}, ${
			crushed ? `crushing ${crushed} of them, ` : ``
		}you also received ${xpReceived.toLocaleString()} XP. ${
			user.minionName
		} asks if you'd like them to do another of the same trip.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Crafting level is now ${newLevel}!`;
		}

		if (roll(10)) {
			if (duration > Time.Minute * 10) {
				loot.bank = multiplyBank(loot.values(), 2);
				loot.add(getRandomMysteryBox());
			}
		}

		await user.addItemsToBank(loot.values(), true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x ${Craft.name}[${Craft.id}]`);
				return this.client.commands.get('craft')!.run(res, [quantity, Craft.name]);
			},
			undefined,
			data,
			loot.bank
		);
	}
}
