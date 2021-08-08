import { Task } from 'klasa';

import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, duration, userID } = data;
		const user = await this.client.users.fetch(userID);

		user.incrementMinigameScore('AgilityArena', ticketsReceived);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log('continued trip of agility arena');
				return this.client.commands.get('agilityarena')!.run(res, []);
			},
			undefined,
			data,
			null
		);
	}
}
