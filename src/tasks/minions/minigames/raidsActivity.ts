import { noOp } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import ChambersOfXeric from 'oldschooljs/dist/simulation/minigames/ChambersOfXeric';

import { createTeam } from '../../../lib/data/cox';
import { RaidsOptions } from '../../../lib/types/minions';
import { sendToChannelID } from '../../../lib/util/webhook';

// const uniques = [
// 	21034,
// 	21079,
// 	20997,
// 	21003,
// 	21043,
// 	21012,
// 	21018,
// 	21021,
// 	21024,
// 	13652,
// 	22386,
// 	20851,
// 	21000,
// 	21015,
// 	22388,
// 	22390,
// 	22392,
// 	22394,
// 	22396
// ];

export default class extends Task {
	async run({ channelID, users, challengeMode, duration, leader }: RaidsOptions) {
		const allUsers = await Promise.all(users.map(async u => this.client.users.fetch(u)));
		const team = createTeam(allUsers);

		const loot = ChambersOfXeric.complete({
			challengeMode,
			timeToComplete: duration,
			team
		});

		let totalPoints = 0;
		for (const member of team) {
			totalPoints += member.personalPoints;
		}

		let resultMessage = `<@${leader}> Your raid has finished. The total amount of points your team got is ${totalPoints.toLocaleString()}.\n`;
		for (let [userID, _userLoot] of Object.entries(loot)) {
			const user = await this.client.users.fetch(userID).catch(noOp);
			if (!user) continue;
			const personalPoints = team.find(u => u.id === user.id)?.personalPoints;
			user.incrementMinigameScore('Raids', 1);

			const userLoot = new Bank(_userLoot);
			resultMessage += `\n**${user}** received: ||${userLoot}|| (${personalPoints?.toLocaleString()} pts, ${
				Math.round((personalPoints! / totalPoints) * 10000) / 100
			}%`;
			await user.addItemsToBank(userLoot, true);
		}

		sendToChannelID(this.client, channelID, { content: resultMessage });
	}
}
