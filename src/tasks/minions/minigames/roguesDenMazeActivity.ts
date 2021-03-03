import { randInt } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { rogueOutfit } from '../../../lib/data/collectionLog';
import { getMinionName, incrementMinigameScore } from '../../../lib/settings/settings';
import { RoguesDenMazeTaskOptions } from '../../../lib/types/minions';
import { incrementMinionDailyDuration, randomItemFromArray } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: RoguesDenMazeTaskOptions) {
		const { channelID, quantity, duration, userID } = data;

		incrementMinionDailyDuration(this.client, userID, duration);
		incrementMinigameScore(userID, 'RoguesDenMaze', quantity);

		const loot = new Bank();
		const minionName = await getMinionName(userID);

		let str = `<@${userID}>, ${minionName} finished completing ${quantity}x laps of the Rogues' Den Maze.`;

		for (let i = 0; i < quantity; i++) {
			if (randInt(1, 8) <= 5) {
				loot.add(randomItemFromArray(rogueOutfit));
			}
		}

		const gotLoot = loot.length > 0;
		if (!gotLoot) {
			str += '\n**Your minion failed to find any Rogue outfit!**';
		}

		const user = await this.client.users.fetch(userID);
		await user.addItemsToBank(loot.bank, true);

		const image = await this.client.tasks.get('bankImage')!.generateBankImage(
			loot.bank,
			`Loot From ${quantity}x Rogues' Den maze`,
			false,
			{
				showNewCL: 1
			},
			user
		);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log(`continued rogues den`);
				return this.client.commands.get('roguesden')!.run(res, []);
			},
			gotLoot ? image : undefined,
			data,
			loot.bank
		);
	}
}
