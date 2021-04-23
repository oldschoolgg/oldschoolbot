import { noOp } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';
import ChambersOfXeric from 'oldschooljs/dist/simulation/minigames/ChambersOfXeric';

import { Emoji } from '../../../lib/constants';
import { coxLog } from '../../../lib/data/collectionLog';
import { createTeam } from '../../../lib/data/cox';
import { RaidsOptions } from '../../../lib/types/minions';
import resolveItems from '../../../lib/util/resolveItems';
import { sendToChannelID } from '../../../lib/util/webhook';

const notPurple = resolveItems(['Torn prayer scroll', 'Dark relic']);
const purpleItems = Object.values(coxLog)
	.flat(2)
	.filter(i => !notPurple.includes(i));

export default class extends Task {
	async run({ channelID, users, challengeMode, duration, leader }: RaidsOptions) {
		const allUsers = await Promise.all(users.map(async u => this.client.users.fetch(u)));
		const team = await createTeam(allUsers, challengeMode);

		const loot = ChambersOfXeric.complete({
			challengeMode,
			timeToComplete: duration,
			team
		});

		let totalPoints = 0;
		for (const member of team) {
			totalPoints += member.personalPoints;
		}

		let resultMessage = `<@${leader}> Your ${
			challengeMode ? 'Challenge Mode Raid' : 'Raid'
		} has finished. The total amount of points your team got is ${totalPoints.toLocaleString()}.\n`;
		for (let [userID, _userLoot] of Object.entries(loot)) {
			const user = await this.client.users.fetch(userID).catch(noOp);
			if (!user) continue;
			const { personalPoints, deaths, deathChance } = team.find(u => u.id === user.id)!;

			if (challengeMode) {
				user.incrementMinigameScore('RaidsChallengeMode', 1);
				user.incrementMinigameScore('Raids', 1);
			} else {
				user.incrementMinigameScore('Raids', 1);
			}

			const userLoot = new Bank(_userLoot);
			const isPurple = userLoot.items().some(([item]) => purpleItems.includes(item.id));
			const str = isPurple ? `${Emoji.Purple} ||${userLoot}||` : userLoot.toString();
			const deathStr = deaths === 0 ? '' : new Array(deaths).fill(Emoji.Skull).join(' ');

			resultMessage += `\n${deathStr} **${user}** received: ${str} (${personalPoints?.toLocaleString()} pts) DeathChance::${deathChance.toFixed(
				2
			)}%`;
			await user.addItemsToBank(userLoot, true);
		}

		sendToChannelID(this.client, channelID, { content: resultMessage });
	}
}
