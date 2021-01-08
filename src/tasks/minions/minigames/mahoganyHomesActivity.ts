import { Task } from 'klasa';

import MahoganyHomesCommand from '../../../commands/Minion/mahoganyhomes';
import { MinigameIDsEnum } from '../../../lib/minions/data/minigames';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../../lib/skilling/types';
import { MahoganyHomesActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: MahoganyHomesActivityTaskOptions) {
		const { channelID, quantity, xp, duration, userID, points } = data;
		const user = await this.client.users.fetch(userID);
		user.incrementMinionDailyDuration(duration);
		user.incrementMinigameScore(MinigameIDsEnum.MahoganyHomes, quantity);

		const currentLevel = user.skillLevel(SkillsEnum.Construction);
		await user.addXP(SkillsEnum.Construction, xp);
		const nextLevel = user.skillLevel(SkillsEnum.Construction);
		await user.settings.update(
			UserSettings.CarpenterPoints,
			user.settings.get(UserSettings.CarpenterPoints) + points
		);

		let str = `${user}, ${
			user.minionName
		} finished doing ${quantity}x Mahogany Homes contracts, you received ${xp.toLocaleString()} Construction XP and ${points} Carpenter points.`;

		if (nextLevel > currentLevel) {
			str += `\n\n${user.minionName}'s Construction level is now ${nextLevel}!`;
		}

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued trip of mahogany homes`);
				return (this.client.commands.get('mahogany') as MahoganyHomesCommand).build(res);
			},
			undefined,
			data
		);
	}
}
