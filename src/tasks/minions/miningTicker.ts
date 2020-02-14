import { Task } from 'klasa';

import { Tasks } from '../../lib/constants';
import removeSubTasksFromActivityTask from '../../lib/util/removeSubTasksFromActivityTask';
import { MiningTickerTaskData } from '../../lib/types/minions';
import runActivityTask from '../../lib/util/runActivityTask';

export default class extends Task {
	async run(data: MiningTickerTaskData) {
		const now = Date.now();
		const tasksThatWereFinished: number[] = [];

		for (const miningTaskData of data.subTasks) {
			// If the current task being checked finishes past now, break.
			if (miningTaskData.finishDate > now) break;

			await runActivityTask(this.client, Tasks.MiningActivity, miningTaskData);

			tasksThatWereFinished.push(miningTaskData.id);
		}

		if (tasksThatWereFinished.length === 0) return;

		await removeSubTasksFromActivityTask(
			this.client,
			Tasks.MiningTicker,
			tasksThatWereFinished
		);
	}
}
