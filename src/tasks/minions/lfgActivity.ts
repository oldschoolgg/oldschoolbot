import { Task } from 'klasa';

import { availableQueues } from '../../commands/Minion/lfg';
import { LfgActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: LfgActivityTaskOptions) {
		const { queueId } = data;
		const lfgQueue = availableQueues.find(queue => queue.uniqueID === queueId)!;
		let extra = lfgQueue.extraParams;
		let handleData = {
			...data,
			...extra
		};
		const leaderUser = await this.client.users.fetch(data.leader);
		const [resultStr, totalLoot] = await lfgQueue.lfgClass.HandleTripFinish(handleData, this.client);
		handleTripFinish(
			this.client,
			leaderUser,
			data.channelID,
			resultStr,
			undefined,
			undefined,
			data,
			totalLoot.bank
		);
	}
}
