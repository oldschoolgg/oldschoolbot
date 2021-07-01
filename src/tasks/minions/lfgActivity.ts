import { Task } from 'klasa';

import {
	addLFGLoot,
	addLFGNoDrops,
	addLFGText,
	availableQueues,
	prepareLFGMessage,
	sendLFGMessages
} from '../../lib/lfg/LfgUtils';
import { LfgActivityTaskOptions } from '../../lib/types/minions';

export default class extends Task {
	async run(data: LfgActivityTaskOptions) {
		const { queueId } = data;
		const lfgQueue = availableQueues.find(queue => queue.uniqueID === queueId)!;

		let extra = lfgQueue.extraParams;

		// Add extra params to the activity
		let handleData = {
			...data,
			...extra,
			...data.extras
		};

		let lootString = prepareLFGMessage(lfgQueue.name, data.quantity, data.channels);

		const { usersWithLoot, usersWithoutLoot, extraMessage } = await lfgQueue.lfgClass.HandleTripFinish({
			data: handleData,
			client: this.client,
			queue: lfgQueue
		});

		usersWithLoot.forEach(e => {
			lootString = addLFGLoot(
				lootString,
				e.emoji,
				e.user,
				e.lootedItems.toString(),
				e.spoiler ?? true,
				data.channels
			);
		});

		if (usersWithoutLoot) {
			lootString = await addLFGNoDrops(lootString, this.client, usersWithoutLoot, data.channels);
		}

		if (extraMessage) {
			lootString = addLFGText(lootString, extraMessage, data.channels);
		}

		await sendLFGMessages(lootString, this.client, data.channels);
	}
}
