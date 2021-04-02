import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { SkillsEnum } from '../../lib/skilling/types';
import { ActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: DungeonOptions) {
		const { channelID, duration, userID } = data;
		const user = await this.client.users.fetch(userID);

		const xpReceived = user.skillLevel(SkillsEnum.Dungeoneering) * 25 * 30;

		const xpRes = await user.addXP(SkillsEnum.Dungeoneering, xpReceived);

		let str = `${user}, ${user.minionName} finished a ${formatDuration(
			duration
		)} Sailing trip. ${xpRes}.`;

		if (roll(100)) {
			str += `\n\n**While Sailing, you find a small puffin on a nearby island and take it back with you.**`;
			await user.addItemsToBank(new Bank().add('Craig'), true);
		}

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
