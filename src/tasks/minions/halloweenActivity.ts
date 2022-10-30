import { randInt } from 'e';

import { ActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const halloweenTask: MinionTask = {
	type: 'HalloweenEvent',
	async run(data: ActivityTaskOptions) {
		let { userID, channelID } = data;
		const user = await mUserFetch(userID);

		const amount = randInt(4, 6);
		await user.update({
			treats_delivered: {
				increment: amount
			}
		});

		handleTripFinish(
			user,
			channelID,
			`${user}, ${user.minionName} finished trick-or-treating, you now have ${amount}x rewards you can claim!`,
			undefined,
			data,
			null
		);
	}
};
