import { Task } from 'klasa';

import { Tasks } from '../../lib/constants';
import removeSubTasksFromActivityTask from '../../lib/util/removeSubTasksFromActivityTask';
import runActivityTask from '../../lib/util/runActivityTask';
import { SkillingTickerTaskData } from '../../lib/types/minions';
import { taskNameFromType } from '../../lib/util/taskNameFromType';
import { instantTrips } from '../../config';

export default class extends Task {
	async run(data: SkillingTickerTaskData) {
		const now = Date.now();
		const tasksThatWereFinished: number[] = [];

		for (const skillingTaskData of data.subTasks) {
			// If the current task being checked finishes past now, break.
			if (skillingTaskData.finishDate > (instantTrips ? Infinity : now)) break;

			runActivityTask(this.client, taskNameFromType(skillingTaskData.type), skillingTaskData);

			tasksThatWereFinished.push(skillingTaskData.id);
		}

		if (tasksThatWereFinished.length === 0) return;

		await removeSubTasksFromActivityTask(
			this.client,
			Tasks.SkillingTicker,
			tasksThatWereFinished
		);
	}
}
