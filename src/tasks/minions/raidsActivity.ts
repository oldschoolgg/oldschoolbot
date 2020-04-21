import { Task } from 'klasa';
import { RaidsActivityTaskOptions } from '../../lib/types/minions';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import { noOp, formatDuration } from '../../lib/util';
import ChambersOfXeric from 'oldschooljs/dist/simulation/minigames/ChambersOfXeric';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';

export default class extends Task {
	async run({ channelID, team, challengeMode, duration }: RaidsActivityTaskOptions) {
		const loot = ChambersOfXeric.complete({
			challengeMode,
			timeToComplete: duration,
			team
		});

		let resultMessage = `The Raid has finished, in a time of ${formatDuration(
			duration
		)}, here is the loot:`;
		for (const [userID, userLoot] of Object.entries(loot)) {
			const user = await this.client.users.fetch(userID).catch(noOp);
			if (!user) continue;
			resultMessage += `\n**${
				user.username
			}** received: ${await createReadableItemListFromBank(this.client, userLoot)}`;
			await user.addItemsToBank(userLoot);
		}

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		this.client.queuePromise(() => {
			channel.send(resultMessage);
		});
	}
}
