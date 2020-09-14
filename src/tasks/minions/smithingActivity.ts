import { Task } from 'klasa';

import { SkillsEnum } from '../../lib/skilling/types';
import { SmithingActivityTaskOptions } from '../../lib/types/minions';
import Smithing from '../../lib/skilling/skills/smithing/smithing';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run({
		smithedBarID,
		quantity,
		userID,
		channelID,
		duration
	}: SmithingActivityTaskOptions) {
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Smithing);

		const SmithedBar = Smithing.SmithedBars.find(SmithedBar => SmithedBar.id === smithedBarID);
		if (!SmithedBar) return;

		const xpReceived = quantity * SmithedBar.xp;

		await user.addXP(SkillsEnum.Smithing, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Smithing);

		let str = `${user}, ${user.minionName} finished smithing ${quantity *
			SmithedBar.outputMultiple}x ${
			SmithedBar.name
		}, you also received ${xpReceived.toLocaleString()} XP.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Smithing level is now ${newLevel}!`;
		}

		const loot = {
			[SmithedBar.id]: quantity * SmithedBar.outputMultiple
		};

		await user.addItemsToBank(loot, true);

		handleTripFinish(this.client, user, channelID, str, res => {
			user.log(`continued trip of  ${SmithedBar.name}[${SmithedBar.id}]`);
			return this.client.commands.get('smith')!.run(res, [quantity, SmithedBar.name]);
		});
	}
}
