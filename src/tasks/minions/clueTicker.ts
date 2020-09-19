import { Task } from 'klasa';

import { instantTrips, production } from '../../config';
import { Tasks } from '../../lib/constants';
import { ClueTickerTaskData } from '../../lib/types/minions';
import removeSubTasksFromActivityTask from '../../lib/util/removeSubTasksFromActivityTask';
import runActivityTask from '../../lib/util/runActivityTask';

export default class extends Task {
	async run(data: ClueTickerTaskData) {
		const now = Date.now();
		const tasksThatWereFinished: string[] = [];

		for (const clueTaskData of data.subTasks) {
			// If the current task being checked finishes past now, break.
			if (clueTaskData.finishDate > (instantTrips && !production ? Infinity : now)) break;

			runActivityTask(this.client, Tasks.ClueActivity, clueTaskData);

			tasksThatWereFinished.push(clueTaskData.id);
		}

		if (tasksThatWereFinished.length === 0) return;

		await removeSubTasksFromActivityTask(this.client, Tasks.ClueTicker, tasksThatWereFinished);
	}
}
