import { Task } from 'klasa';

import { SkillsEnum } from '../../../lib/skilling/types';
import { HunterActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: HunterActivityTaskOptions) {
		let { creatureName, quantity, userID, channelID } = data;
		const user = await this.client.users.fetch(userID);
		const currentLevel = user.skillLevel(SkillsEnum.Herblore);

		

		const newLevel = user.skillLevel(SkillsEnum.Herblore);

		let str = `${user}, ${user.minionName} finished making ${quantity}`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Herblore level is now ${newLevel}!`;
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x ${creatureName}[${creatureName}]`);
				return this.client.commands.get('hunt')!.run(res, [quantity, creatureName]);
			},
			undefined,
			data
		);
	}
}
