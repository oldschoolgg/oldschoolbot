import { Task } from 'klasa';

import { SkillsEnum } from '../../lib/skilling/types';
import { ActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: ActivityTaskOptions) {
		const { channelID, duration, userID } = data;
		const user = await this.client.users.fetch(userID);

		const xpReceived = user.skillLevel(SkillsEnum.Sailing) * 25 * 30;

		const xpRes = await user.addXP(SkillsEnum.Sailing, xpReceived);

		let str = `${user}, ${user.minionName} finished a ${formatDuration(
			duration
		)} Sailing trip. ${xpRes}.`;

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued sailing`);
				return this.client.commands.get('sail')!.run(res, []);
			},
			undefined,
			data,
			null
		);
	}
}
