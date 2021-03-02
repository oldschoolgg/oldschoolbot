import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { getMinionName, incrementMinigameScore } from '../../../lib/settings/settings';
import { RoguesDenMazeTaskOptions } from '../../../lib/types/minions';
import { incrementMinionDailyDuration } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: RoguesDenMazeTaskOptions) {
		const { channelID, quantity, duration, userID } = data;

		incrementMinionDailyDuration(this.client, userID, duration);
		incrementMinigameScore(userID, 'RoguesDenMaze', quantity);

		const loot = new Bank();
		const minionName = await getMinionName(userID);

		let str = `<@${userID}>, ${minionName} finished completing ${quantity}x laps of the Rogues' Den Maze.`;

		const user = await this.client.users.fetch(userID);
		await user.addItemsToBank(loot.bank, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued rogues den`);
				return this.client.commands.get('roguesden')!.run(res, []);
			},
			undefined,
			data,
			null
		);
	}
}
