import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import ChambersOfXeric from 'oldschooljs/dist/simulation/minigames/ChambersOfXeric';

import { getRandomMysteryBox } from '../../lib/data/openables';
import { RaidsActivityTaskOptions } from '../../lib/types/minions';
import { filterBankFromArrayOfItems, noOp, roll } from '../../lib/util';
import { sendToChannelID } from '../../lib/util/webhook';

const uniques = [
	21034,
	21079,
	20997,
	21003,
	21043,
	21012,
	21018,
	21021,
	21024,
	13652,
	22386,
	20851,
	21000,
	21015,
	22388,
	22390,
	22392,
	22394,
	22396
];

export default class extends Task {
	async run({
		channelID,
		team,
		challengeMode,
		duration,
		partyLeaderID
	}: RaidsActivityTaskOptions) {
		const loot = ChambersOfXeric.complete({
			challengeMode,
			timeToComplete: duration,
			team
		});

		let totalPoints = 0;
		for (const member of team) {
			totalPoints += member.personalPoints;
		}

		let resultMessage = `<@${partyLeaderID}> Your raid has finished. The total amount of points your team got is ${totalPoints.toLocaleString()}.\n`;
		for (let [userID, _userLoot] of Object.entries(loot)) {
			const userLoot = new Bank(_userLoot);
			const user = await this.client.users.fetch(userID).catch(noOp);
			const purple =
				Object.keys(filterBankFromArrayOfItems(uniques, userLoot.bank)).length > 0;
			if (!user) continue;
			const personalPoints = team.find(u => u.id === user.id)?.personalPoints;
			user.incrementMinigameScore('Raids', 1);
			if (roll(10)) {
				userLoot.multiply(2);
				userLoot.add(getRandomMysteryBox());
			} else if (user.usingPet('Flappy')) {
				userLoot.multiply(2);
			}

			if (roll(4500)) {
				userLoot.add('Takon');
			}
			if (roll(140)) {
				userLoot.add('Clue scroll (grandmaster)');
			}
			if (roll(2000)) {
				userLoot.add('Steve');
			}

			resultMessage += `\n**${user}** received: ${
				purple ? '🟪' : ''
			} ||${userLoot}|| (${personalPoints?.toLocaleString()} pts, ${
				Math.round((personalPoints! / totalPoints) * 10000) / 100
			}%${user.usingPet('Flappy') ? `, <:flappy:812280578195456002> 2x loot` : ''})`;
			await user.addItemsToBank(userLoot, true);
		}

		sendToChannelID(this.client, channelID, { content: resultMessage });
	}
}
