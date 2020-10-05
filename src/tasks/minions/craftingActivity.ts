import { Task } from 'klasa';

import Crafting from '../../lib/skilling/skills/crafting';
import { SkillsEnum } from '../../lib/skilling/types';
import { CraftingActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run({ craftableID, quantity, userID, channelID, duration }: CraftingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Crafting);

		const Craft = Crafting.Craftables.find(craft => craft.id === craftableID);

		if (!Craft) return;

		const xpReceived = quantity * Craft.xp;

		await user.addXP(SkillsEnum.Crafting, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Crafting);

		let str = `${user}, ${user.minionName} finished crafting ${quantity} ${
			Craft.name
		}, you also received ${xpReceived.toLocaleString()} XP.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Crafting level is now ${newLevel}!`;
		}

		const loot = {
			[Craft.id]: quantity
		};

		await user.addItemsToBank(loot, true);

		handleTripFinish(this.client, user, channelID, str, undefined, undefined, res => {
			user.log(`continued trip of ${quantity}x ${Craft.name}[${Craft.id}]`);
			return this.client.commands.get('craft')!.run(res, [quantity, Craft.name]);
		});
	}
}
