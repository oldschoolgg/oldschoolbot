import { Task } from 'klasa';

import Constructables from '../../lib/skilling/skills/construction/constructables';
import { SkillsEnum } from '../../lib/skilling/types';
import { ConstructionActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: ConstructionActivityTaskOptions) {
		const { objectID, quantity, userID, channelID, duration } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		const currentLevel = user.skillLevel(SkillsEnum.Construction);
		const object = Constructables.find(object => object.id === objectID)!;
		const xpReceived = quantity * object.xp;
		await user.addXP(SkillsEnum.Construction, xpReceived);
		const newLevel = user.skillLevel(SkillsEnum.Construction);

		let str = `${user}, ${user.minionName} finished constructing ${quantity}x ${
			object.name
		}, you also received ${xpReceived.toLocaleString()} XP.`;

		if (newLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Construction level is now ${newLevel}!`;
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of ${quantity}x ${object.name}[${object.id}]`);
				return this.client.commands.get('construct')!.run(res, [quantity, object.name]);
			},
			undefined,
			data
		);
	}
}
