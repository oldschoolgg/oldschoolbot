import { Task } from 'klasa';
import { RaidsActivityTaskOptions } from '../../lib/types/minions';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import { noOp, formatDuration } from '../../lib/util';
import ChambersOfXeric from 'oldschooljs/dist/simulation/minigames/ChambersOfXeric';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import filterBankFromArrayOfItems from '../../lib/util/filterBankFromArrayOfItems';

const uniques = [
	21034,
	21079,
	20997,
	21003,
	21006,
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
			const purple = Object.keys(filterBankFromArrayOfItems(uniques, userLoot)).length > 0;
			if (!user) continue;
			resultMessage += `\n**${user.username}** received: ${
				purple ? '🟪' : ''
			} ||${await createReadableItemListFromBank(this.client, userLoot)}||`;
			await user.addItemsToBank(userLoot);
		}

		const channel = this.client.channels.get(channelID);
		if (!channelIsSendable(channel)) return;

		this.client.queuePromise(() => {
			channel.send(resultMessage);
		});
	}
}
